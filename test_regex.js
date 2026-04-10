const subject = "Hi";
const snippet = "Hello";
const sender = "Pratik Lamichhane";
const subjLower = subject.toLowerCase();

if (subjLower.trim().match(/^(?:re:\s*|fwd:\s*)?(hi|hello|hey|test|testing|yo|sup|\(no subject\)|no subject)$/i)) {
    console.log("KILLED");
} else {
    console.log("PASSED");
}
