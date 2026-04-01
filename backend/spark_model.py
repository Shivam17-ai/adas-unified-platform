from pyspark.sql import SparkSession
from pyspark.ml.feature import VectorAssembler
from pyspark.ml.classification import RandomForestClassifier
from pyspark.ml import Pipeline
import pandas as pd

# 1. Initialize Distributed Spark Session
spark = SparkSession.builder \
    .appName("ADAS_Severity_Prediction") \
    .config("spark.driver.bindAddress", "127.0.0.1") \
    .getOrCreate()

print("PySpark Session Initialized.")

# 2. Load the data engineered by R
data = spark.read.csv("session_engineered.csv", header=True, inferSchema=True)

# 3. Prepare Features for the ML Model
feature_cols = ["FL", "FR", "BL", "BR", "Rel_Speed", "Session_Aggression_Score"]

# Ensure all columns are cast to double to avoid schema errors
for col_name in feature_cols:
    data = data.withColumn(col_name, data[col_name].cast("double"))
data = data.withColumn("Danger", data["Danger"].cast("double"))

assembler = VectorAssembler(inputCols=feature_cols, outputCol="features", handleInvalid="skip")

# 4. Define the Random Forest Model
# Predicting 'Danger' using the edge sensor data + R features
rf = RandomForestClassifier(labelCol="Danger", featuresCol="features", numTrees=10)

# 5. Build and Run the Pipeline
pipeline = Pipeline(stages=[assembler, rf])
model = pipeline.fit(data)
predictions = model.transform(data)

# 6. Save the final ML predictions back to CSV for the Node.js API
pdf = predictions.select("*", "prediction").toPandas()
pdf.to_csv("session_final_spark.csv", index=False)

print("PySpark ML Pipeline Complete. Output saved to session_final_spark.csv")
spark.stop()