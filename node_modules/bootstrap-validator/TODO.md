### TODO
* Change feedback to check if .form-group .has-feedback.
* Add a way to reliably determine if form is valid or invalid upon submit. (#67)
* Add a class to the form to indicate validity state
* Improve invald/valid error events, add post-delay events.
* Maybe DON'T not validate hidden invisible fields? (#134) (#115)
* Refactor validators to optionally return promises. (#131)
* Immediately validate on blur (#130)
* Handle feedback icons in .destroy(). (#123)
* Set focus to first invalid field on submit. (#128)


######Remote
* Only send request if field is dirty (#152)
* Defer remote validation while request is still pending. (#72)
* Change remote validator to use response body as error message.

### DONE
