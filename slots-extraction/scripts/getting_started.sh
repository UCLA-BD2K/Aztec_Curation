#!/bin/sh

# This script clears the terminal first. (Grobid service is assumed running.)
# The script then makes calls to the other 4 python scripts in the directory 
# in order: begining with the user submitted data on form entry to finally the 
# extraction of the relevant fields such as author names, author affiliations, 
# title of publication, abstract, conclusions/resulst, acknowledgements, 
# all links, some predicted source links and grant information. 

clear 

#python /Users/davidmeng/Desktop/Aztec_Curation/slots-extraction/scripts/json_extract.py -source /Users/davidmeng/Desktop/Aztec_Curation/slots-extraction/data/solrResources.json -USRFilename /Users/davidmeng/Desktop/Aztec_Curation/slots-extraction/data/userSubmittedRecords.json -USRPubDOIFilename /Users/davidmeng/Desktop/Aztec_Curation/slots-extraction/data/userSubmittedWithPubDOIs.json

#echo "'Source: User Submitted' records with PublicationDOI filtered out."

#python /Users/davidmeng/Desktop/Aztec_Curation/slots-extraction/scripts/crossref_extract.py -source /Users/davidmeng/Desktop/Aztec_Curation/slots-extraction/data/userSubmittedWithPubDOIs.json -incorrectsOut /Users/davidmeng/Desktop/Aztec_Curation/slots-extraction/data/incorrectDOIRecords.json -correctsOut /Users/davidmeng/Desktop/Aztec_Curation/slots-extraction/data/correctDOIRecords.json -crossrefOut /Users/davidmeng/Desktop/Aztec_Curation/slots-extraction/data/crossrefRecords.json -journalsOut /Users/davidmeng/Desktop/Aztec_Curation/slots-extraction/data/journalCounts.json

#echo "CrossRef records for the user submitted tools with PublicationDOI written to file."

# For conveniece, "papers" holding some journal pdfs are already given here. 
# Please See: Albert's code should handle the downloading of the PDFs from actual DOIs. 
#parent_path=$( cd "$(dirname "${BASH_SOURCE}")" ; pwd -P )
#parent_path=$( pwd -P)
#echo $parent_path

# echo "Extracting pdfs now"
python $PWD/slots-extraction/scripts/pdf_extract.py -pdfpath $PWD/slots-extraction/data/papers/ -outpathXML $PWD/slots-extraction/data/XMLExtracts/ -outpathText $PWD/slots-extraction/data/textExtracts/ 

# echo "XML and Raw text of the pdfs of the tools are extracted."

python $PWD/slots-extraction/scripts/parse_extracts.py -XMLFiles $PWD/slots-extraction/data/XMLExtracts/ -textFiles $PWD/slots-extraction/data/textExtracts/ -correctDOIRecords $PWD/slots-extraction/data/correctDOIRecords.json -outfile $PWD/slots-extraction/data/slotExtracts/slot_extracts.json

# echo "$PWD/slots-extraction/data/slotExtracts/slot_extracts.json"
# echo "All possible metadata extractions from XMLs DONE."
