#!/bin/sh
# this script deletes the pdf in the uploads folder 
echo $PWD
echo 'I am deleting stuff now'
rm -fr $PWD/slots-extraction/data/papers/* 
# do the same for text extracts, XMl extracts and slotExtracts
