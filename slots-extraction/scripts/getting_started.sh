#!/bin/sh

# This script clears the terminal first. (Grobid service is assumed running.)
# The script then makes calls to the other 4 python scripts in the directory 
# in order: begining with the user submitted data on form entry to finally the 
# extraction of the relevant fields such as author names, author affiliations, 
# title of publication, abstract, conclusions/resulst, acknowledgements, 
# all links, some predicted source links and grant information. 

clear 
python $PWD/slots-extraction/scripts/pdf_extract.py -pdfpath $PWD/slots-extraction/data/papers/ -outpathXML $PWD/slots-extraction/data/XMLExtracts/ -outpathText $PWD/slots-extraction/data/textExtracts/ 
python $PWD/slots-extraction/scripts/parse_extracts.py -XMLFiles $PWD/slots-extraction/data/XMLExtracts/ -textFiles $PWD/slots-extraction/data/textExtracts/ -correctDOIRecords $PWD/slots-extraction/data/correctDOIRecords.json -outfile $PWD/slots-extraction/data/slotExtracts/slot_extracts.json
