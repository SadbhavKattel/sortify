package com.sortify;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SortifyApplication {

    public static void main(String[] args) {
        SpringApplication.run(SortifyApplication.class, args);
    }

}
