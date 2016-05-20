#!/bin/sh
# this script deletes the pdf in the uploads folder 
rm -fr $PWD/slots-extraction/data/$1 #papers/*  - I don't know if I should keep the folder
# rm -fr $PWD/slots-extraction/data/$1/ #slotExtracts/* 
# rm -fr $PWD/slots-extraction/data/$1/ #textExtracts/*
# rm -fr $PWD/slots-extraction/data/$1/ #XMLExtracts/* 

# do the same for text extracts, XMl extracts and slotExtracts
