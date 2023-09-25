FROM python:3.10-bookworm

RUN apt-get update --fix-missing
RUN apt-get install -y nodejs npm
RUN apt-get install -y git

WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --upgrade pip
RUN pip install --trusted-host pypi.python.org -r requirements.txt

RUN npm install 

# Make port 80 available to the world outside this container
EXPOSE 8080

# Define environment variable
ENV NAME doctorine-doctor

# Run app.py when the container launches
CMD ["python", "app.py"]