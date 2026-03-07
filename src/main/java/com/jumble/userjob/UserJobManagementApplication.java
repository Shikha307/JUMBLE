package com.jumble.userjob;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.data.mongodb.repository.config.EnableMongoRepositories
public class UserJobManagementApplication {

	public static void main(String[] args) {
		SpringApplication.run(UserJobManagementApplication.class, args);
	}

}
