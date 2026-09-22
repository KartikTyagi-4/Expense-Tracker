package com.expensetracker.exception;

import java.util.Map;

public record ErrorResponse(int status, String message, Map<String, String> errors) {
}
