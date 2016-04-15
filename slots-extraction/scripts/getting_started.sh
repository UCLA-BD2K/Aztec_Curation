#!/bin/sh

# This script clears the terminal first. (Grobid service is assumed running.)
# The script then makes calls to the other 4 python scripts in the directory 
# in order: begining with the user submitted data on form entry to finally the 
# extraction of the relevant fields such as author names, author affiliations, 
# title of publication, abstract, conclusions/resulst, acknowledgements, 
# all links, some predicted source links and grant information. 

clear 

python json_extract.py -source ../data/solrResources.json -USRFilename ../data/userSubmittedRecords.json -USRPubDOIFilename ../data/userSubmittedWithPubDOIs.json

echo "'Source: User Submitted' records with PublicationDOI filtered out."

python crossref_extract.py -source ../data/userSubmittedWithPubDOIs.json -incorrectsOut ../data/incorrectDOIRecords.json -correctsOut ../data/correctDOIRecords.json -crossrefOut ../data/crossrefRecords.json -journalsOut ../data/journalCounts.json

echo "CrossRef records for the user submitted tools with PublicationDOI written to file."

# For conveniece, "papers" holding some journal pdfs are already given here. 
# Please See: Albert's code should handle the downloading of the PDFs from actual DOIs. 
python pdf_extract.py -pdfpath ../data/papers/ -outpathXML ../data/XMLExtracts/ -outpathText ../data/textExtracts/ 

echo "XML and Raw text of the pdfs of the tools are extracted."

python parse_extracts.py -XMLFiles ../data/XMLExtracts/ -textFiles ../data/textExtracts/ -correctDOIRecords ../data/correctDOIRecords.json -outfile ../data/slotExtracts/slot_extracts.json

echo "All possible metadata extractions from XMLs DONE."
