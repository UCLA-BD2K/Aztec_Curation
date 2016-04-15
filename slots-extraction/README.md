
### Dependencies to install before Getting Started: 
- xpdf, pdftotext (http://www.foolabs.com/xpdf/download.html)
- Grobid (http://grobid.readthedocs.org/en/latest/Install-Grobid/)
- xmltodict (https://github.com/martinblech/xmltodict)
- nltk : Natural Language Toolkit

###  Installing the Dependencies: 
- MAC (using macports and homebrew):
    - nltk: `sudo pip install -U nltk`
            - in the unix python shell add `import nltk` and `nltk.download('punkt')`
    - xpdf: `sudo port install xpdf` 
    - xmltodict: `pip install xmltodict`
    - grobid: 
      - installation using maven, if you don't have maven run: `brew install maven`
      -  `wget https://github.com/kermitt2/grobid/archive/grobid-parent-0.4.0.zip`
      - `unzip grobid-grobid-parent-0.4.0.zip`
      - `cd grobid-grobid-parent`
      - `mvn clean install`
    - run grobid before launching getting_started.sh:
      - `cd grobid-service`
      - `mvn -Dmaven.test.skip=true jetty:run-war`

    - go to localhost:8080 to check if grobid is running in the background
- Linux:
  - ntlk: `apt-get -y install python-pip` (if you don't have pip and then the same steps as Mac)
  - xpdf : `sudo aptitude install xpdf`
  - xmltodict: `sudo apt install python-xmltodict`
  - grobid: follow the same steps as mac

### Getting Started: 
Use the Getting Started script (getting_started.sh) to get rolling with the code. 
Any mention of "Slot" here refers to the "fields" in the database to be filled.
Note: Please get the Grobid service up and running before executing the scripts. 
Follow instructions in http://grobid.readthedocs.org/en/latest/Grobid-service/ to get the service up. 

### About the scripts (in order executed): 
**json_extract.py** - This script is to read the json records generated on form entry by the user/automated scripts used previously, and extract only those records that are manually submitted by the users ('source': 'User Submitted') and with a PublicationDOI. Please use: 'python json_extract.py -h' to see options.

**crossref_extract.py** - This script is to read the tool records which ahve a PublicationDOI entered as part of the form entry by the Users. Determine if the DOI is correct or incorrect. Get the CrossRef record for the correct DOIs, append to tool record and write to file. Additionally, the publishers count is also extracted for analysis. Please use: 'python crossref_extract.py -h' for options.

**script3.py** - Albert's script. Input: UserSubmitted records with correct Publication DOI. Output: Pdf associated with correctDOI downloaded to ./data/papers/ folder.

**pdf_extract.py** - At this point, this script assumes that the Journal pdf for the correct publication DOI (previously determined using CrossRef) has been downloaded to ./data/papers Folder. (Albert's script would take care of this.) All PDFs within the folder are read and parsed through Grobid (which has pretrained CRF models in it) to extract the text in the PDF into an annotated XML. The XML is in TEI format.Additionally, the raw text from the PDF is also extract to a different folder. Please use: 'python pdf_extract.py -h' for options.

**parse_extracts.py** - This final script then interacts with the XML and text extracts of the Journal pdf to extract: authors, author affiliations, title, links, some predictions of possible source links, abstract, conclusions/results, the keywords from the journal, keywords from the DOI (CrossRef record), acknowledgements and possible grant information. See last note for extraction schema. Please use: 'python parse_extracts.py -h' for options.

### Note: 
- Currently, the slots are extracted for a batch of ./data/papers. 
  To extract one DOI at a time: the functions can easily be reused as API and following usage as in scripts above. 
- Extraction Schema & Example extraction:
  https://docs.google.com/document/d/1QMm7gd6a3I2r7_-I2bRJH2jpWrhN4FsMa0-m6AxShiE/edit?usp=sharing
