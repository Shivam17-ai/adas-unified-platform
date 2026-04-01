# Read the raw session data collected by Node.js
data <- read.csv("session_raw.csv")

# 1. Calculate a Combined Rear Threat factor
if("BL" %in% names(data) & "BR" %in% names(data)) {
    data$Rear_Threat <- (data$BL + data$BR) / 2
} else {
    data$Rear_Threat <- 0
}

# 2. Derive a custom 'Session_Aggression_Score'
if("Rel_Speed" %in% names(data) & "Min_Dist" %in% names(data)) {
    data$Session_Aggression_Score <- ifelse(data$Min_Dist > 0, 
                                           (data$Rel_Speed / data$Min_Dist) * 100, 
                                           0)
} else {
    data$Session_Aggression_Score <- 0
}

# 3. Create a Categorical Status based on the new Aggression Score
data$Engineered_Status <- ifelse(data$Session_Aggression_Score > 50, "CRITICAL RISK",
                          ifelse(data$Session_Aggression_Score > 20, "WARNING", "SAFE"))

# Write the engineered dataset back for Node to consume
write.csv(data, "session_engineered.csv", row.names = FALSE)
cat("Feature engineering complete.\n")