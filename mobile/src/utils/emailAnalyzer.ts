export function analyzeEmailImportance(subject: string, sender: string, snippet: string): { surface: boolean; priority: 'high' | 'medium'; score: number; category: string; reason: string } {
  const subjLower = subject.toLowerCase();
  const snippetLower = snippet.toLowerCase();
  const senderLower = sender.toLowerCase();
  
  let score = 0;
  let category = 'exclude';
  let reason = 'Ignored by default';
  
  // NEVER SURFACE IF
  const isSocial = senderLower.match(/(reddit|linkedin|twitter|instagram|facebook|tiktok|pinterest|snapchat|youtube|quora|discord)/);
  const isNoReply = senderLower.match(/(no-reply|noreply|newsletter|digest|hello@|info@|marketing@|team@|support@)/);
  const isPromo = snippetLower.match(/(unsubscribe|% off|discount|sale|offer)/) || subjLower.match(/(digest|newsletter|weekly|roundup|trending|notifications|sale|offer|% off|deal|limited time)/);
  const isCompanyAnnouncement = subjLower.match(/(announcement|press release|product update)/);
  
  if (isSocial) score -= 50;
  if (senderLower.includes('linkedin')) score -= 45;
  if (senderLower.includes('reddit')) score -= 40;
  if (isNoReply) score -= 35;
  if (subjLower.match(/(digest|newsletter|weekly|roundup|trending|notifications)/)) score -= 30;
  if (isPromo) score -= 25;
  if (snippetLower.match(/(stranger|cold outreach|sales pitch)/)) score -= 20;

  // Stricter natural language penalties
  if (subjLower.trim().match(/^(?:re:\s*|fwd:\s*)?(hi|hello|hey|test|testing|yo|sup|\(no subject\)|no subject)$/i)) {
    return { surface: false, priority: 'medium', score: -999, category: 'exclude', reason: 'Casual or empty subject detected' };
  }
  if ((subject + snippet).length < 30) {
    score -= 25; // Penalty for extremely short/casual non-substantive emails
  }

  // Simplified heuristics based on prompt
  if (!isNoReply && !isSocial && senderLower.includes(' ')) {
    score += 70; // 50 for human + 20 assuming they are a known contact since they hit Primary inbox
    category = 'human';
    reason = 'Real human sender';
  }
  if (subjLower.startsWith('re:')) {
    score += 40;
    category = 'work';
    reason = 'Direct reply to you';
  }
  if (senderLower.match(/(.edu|.gov|university|college|legal|court|attorney)/)) {
    score += 35;
    category = 'academic';
    reason = 'University or legal communication';
  }
  if (subjLower.match(/(urgent|response needed|following up|action required|interview|job offer)/)) {
    score += 30;
    category = 'work';
    reason = 'Action required or urgent follow up';
  }
  
  const surface = score >= 70;
  const priority = score >= 85 ? 'high' : 'medium';
  
  return { surface, priority, score, category: surface ? category : 'exclude', reason };
}

export function analyzeEmailDeadline(subject: string, snippet: string): { surface: boolean; priority: 'high' | 'medium'; score: number; deadline_date: string | null; category: string; reason: string } {
  const subjLower = subject.toLowerCase();
  const snippetLower = snippet.toLowerCase();
  const combined = subjLower + ' ' + snippetLower;
  
  let score = 0;
  let category = 'exclude';
  let reason = 'No deadline detected';

  // NEVER SURFACE IF
  if (combined.match(/(shipped|on its way|arriving|delivery confirmation)/)) {
    score -= 35;
  }
  if (combined.match(/(sale ends|hurry|limited stock|limited time)/)) {
    score -= 40;
  }
  if (combined.match(/(newsletter|digest).*(upcoming)/)) {
    score -= 30;
  }

  // SCORING
  if (combined.match(/(due today|tomorrow|in 24 hours|within 72 hours)/)) {
    score += 60;
    category = 'payment';
    reason = 'Explicit due date within 72 hours';
  } else if (combined.match(/(overdue|past due|final notice|immediate action|payment declined)/)) {
    score += 50;
    category = 'payment';
    reason = 'Payment overdue or final notice';
  } else if (combined.match(/(check-in|cancellation window|flight|hotel.*action)/)) {
    score += 45;
    category = 'travel';
    reason = 'Travel action required';
  } else if (combined.match(/(application|submission).*(deadline|closes|due).*7 days/)) {
    score += 40;
    category = 'application';
    reason = 'Application deadline within 7 days';
  } else if (combined.match(/(trial ending|auto-renew|subscription renews)/)) {
    score += 35;
    category = 'subscription';
    reason = 'Trial or subscription renewing soon';
  }
  
  if (combined.match(/(due by|due on|expires|deadline|last day|act by|respond by|before)/)) {
    score += 60;
    category = 'appointment';
    reason = 'Explicit deadline detected';
  } else if (combined.match(/(reminder|upcoming|important update)/)) {
    score += 55;
    category = 'appointment';
    reason = 'Upcoming reminder';
  }
  
  if (combined.match(/(final notice|last chance|action required|important update|reminder)/)) {
    score += 20;
  }

  const surface = score >= 50;
  const priority = score >= 85 ? 'high' : 'medium';

  return { surface, priority, score, deadline_date: null, category: surface ? category : 'exclude', reason };
}

export function analyzeEmailAlert(subject: string, snippet: string): { surface: boolean; priority: 'high' | 'medium'; score: number; severity: string; category: string; reason: string } {
  const subjLower = subject.toLowerCase();
  const snippetLower = snippet.toLowerCase();
  const combined = subjLower + ' ' + snippetLower;
  
  let score = 0;
  let category = 'exclude';
  let reason = 'No alert detected';
  let severity = 'exclude';

  // NEVER SURFACE IF
  if (combined.match(/(mentioned you|liked your|viewed your profile|connection request|retweeted)/)) {
    score -= 60;
  }
  if (combined.match(/(your cart is waiting|unread messages|missed out|you have messages)/)) {
    score -= 50;
  }
  if (combined.match(/(google alert|news digest)/)) {
    score -= 40;
  }

  // SCORING
  if (combined.match(/(unauthorized transaction|fraud detected|card compromised)/)) {
    score += 70;
    severity = 'critical';
    category = 'fraud';
    reason = 'Fraud or unauthorized transaction detected';
  } else if (combined.match(/(account compromised|hacked|password changed)/)) {
    score += 65;
    severity = 'critical';
    category = 'security';
    reason = 'Account compromised or hacked';
  } else if (combined.match(/(otp|verification code|two-factor).*(requested|sent)/) && !combined.match(/(your requested|requested by you)/)) {
    score += 60;
    severity = 'critical';
    category = 'security';
    reason = 'OTP sent without explicit request context';
  } else if (combined.match(/(account locked|suspended|disabled)/)) {
    score += 55;
    severity = 'high';
    category = 'account';
    reason = 'Account locked or suspended';
  } else if (combined.match(/(failed payment|payment declined|card declined)/)) {
    score += 50;
    severity = 'high';
    category = 'payment';
    reason = 'Failed or declined payment';
  } else if (combined.match(/(unusual login|new device|unrecognized device|new sign-in)/)) {
    score += 45;
    severity = 'high';
    category = 'security';
    reason = 'Unusual login or new device detected';
  } else if (combined.match(/(data breach|security incident)/)) {
    score += 40;
    severity = 'high';
    category = 'security';
    reason = 'Data breach notification';
  } else if (combined.match(/(delivery exception|package delayed|held at customs|returned to sender)/)) {
    score += 35;
    severity = 'medium';
    category = 'delivery';
    reason = 'Delivery exception';
  } else if (combined.match(/(alert|security|warning|action required|verify|unusual)/)) {
    score += 60;
    severity = 'medium';
    category = 'account';
    reason = 'General security or account alert';
  }
  
  if (combined.match(/(unauthorized|suspicious|unusual activity|compromised|breach|immediate action)/)) {
    score += 50;
  }

  const surface = score >= 50;
  const priority = (severity === 'critical' || severity === 'high') ? 'high' : 'medium';

  return { surface, priority, score, severity: surface ? severity : 'exclude', category: surface ? category : 'exclude', reason };
}
