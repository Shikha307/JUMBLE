FROM python:3.11-slim
WORKDIR /app

# Install system deps for torch and building wheels
RUN apt-get update && apt-get install -y --no-install-recommends gcc g++ && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY matcher.py .

# The output directory will be mounted as a volume
CMD ["python", "-u", "matcher.py"]
