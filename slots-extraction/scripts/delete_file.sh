#!/bin/sh
# this script deletes the pdf in the uploads folder 
rm -fr $PWD/slots-extraction/data/papers/* 
rm -fr $PWD/slots-extraction/data/slotExtracts/* 
rm -fr $PWD/slots-extraction/data/textExtracts/*
rm -fr $PWD/slots-extraction/data/XMLExtracts/* 

# do the same for text extracts, XMl extracts and slotExtracts
