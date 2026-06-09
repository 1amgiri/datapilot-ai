package com.datapilot.exception;

public class AgentProcessingException extends BusinessException {
    public AgentProcessingException(String message) {
        super(message);
    }
    public AgentProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}
