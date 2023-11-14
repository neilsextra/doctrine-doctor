# Doctrine Doctor
**CouchDB sample application***.

This application is able store and search Army Doctrine. 

Doctrine comprises of 4 components:

Documents: Are fundamental to how Army Doctrine Operates.  A Document also has associated metadata that both describes the document and any associated caveats. 

Observations: Are  observations associated with doctrine.

Lessons: Are lessons associated with doctrine.

Insights: Are any insight gained from the execution of a specific doctrine.

Links can relate documents with observations, insights, lessons and insights.  Futhermore, links can be created with any component to create a doctrine network.

```bash
# Clone this repository
git clone https://github.com/thesourorange/neils-extra/doctrine-doctor.git
# Go into the repository
```

To Build Doctrine Doctor perform the follwoing commands:

```bash
# Install the Python dependencies
pip install -r requirements.txt

# Install the Node dependencies
npm install

# Build the Docker Image
docker build -t "doctrine-doctor:[version]" .

# Run the Docker Image -  this will popup a CouchDB connection Screen
docker run -p "8080:8080" "doctrine-doctor:[version]"

# Alternatively you can run without the Popup
docker run -p "8080:8080" -D "COUCHDB_URL:[couchdb-url]" "doctrine-doctor:[version]"

```

CouchDB URL is in the form:
http://[userid]:[password]@localhost:5984

Within a Docker Image:
http://[userid]:[password]@host.docker.internal:5984
 
