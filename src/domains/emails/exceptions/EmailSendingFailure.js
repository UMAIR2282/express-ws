module.exports = function EmailSendingFailure(error = null) {
  this.message = 'email_failure';
  this.status = 502;
  this.success = false;
  this.error = error;
  this.validationErrors = { email: 'email_failure' };
};
