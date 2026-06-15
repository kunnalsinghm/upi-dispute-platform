package com.upi.dispute;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    public static final String DISPUTES_CREATED = "disputes.created";
    public static final String DISPUTES_RESOLVED = "disputes.resolved";

    @Bean
    public NewTopic disputesCreatedTopic() {
        return TopicBuilder.name(DISPUTES_CREATED)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic disputesResolvedTopic() {
        return TopicBuilder.name(DISPUTES_RESOLVED)
                .partitions(3)
                .replicas(1)
                .build();
    }
}