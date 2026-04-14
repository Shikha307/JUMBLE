ARG BASE_IMAGE
FROM ${BASE_IMAGE:-python:3.11-slim}

WORKDIR /app

COPY matcher.py .

# The output directory will be mounted as a volume
CMD ["python", "-u", "matcher.py"]
