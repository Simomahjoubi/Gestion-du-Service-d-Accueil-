package ma.fondation.accueil;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AccueilApplication {

    public static void main(String[] args) {
        SpringApplication.run(AccueilApplication.class, args);
    }
}
