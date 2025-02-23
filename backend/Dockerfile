# Use official Python image
FROM python:3.10

# Set working directory
WORKDIR /app

# Copy requirements.txt into the container
COPY requirements.txt .

# Install dependencies (including Uvicorn)
RUN pip install --no-cache-dir -r requirements.txt uvicorn

ENV PYTHONPATH=/pythonProject/backend

# Copy the rest of the application code
COPY . .

# Expose FastAPI default port
EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head && uvicorn backend.main:app --host 0.0.0.0 --port 8000"]


# Run FastAPI app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

COPY alembic alembic
COPY alembic.ini alembic.ini
