// Function to validate a single field
function validateField(field) {
    if ($(field).val().trim() === "") {
      $(field).addClass('is-invalid');
    } else {
      $(field).removeClass('is-invalid');
    }
}

// Validate Philippine phone number format
function validatePhoneNumber(phoneNumber) {
  const regex = /^(?:\+63\s?9|09)\d{2}\s?\d{3}\s?\d{4}$/; // Matches +63 9xx xxx xxxx or 09xx xxx xxxx
  return regex.test(phoneNumber);
}
// Validate PUP Webmail format
function validateWebmail(webmail) {
  // const regex = /^[^\s@]+@iskolarngbayan\.pup\.edu\.ph$/; // Matches @iskolarngbayan.pup.edu.ph
  // return regex.test(webmail);
  return true;
}

// Validate Student Number format
function validateStudentNumber(studentNumber) {
  const regex = /^\d{4}-\d{5}-[A-Za-z]{2}-\d$/; // Matches xxxx-xxxxx-xx-x
  return regex.test(studentNumber);
}

// Validate Alumni Number format
function validateAlumniNumber(alumniNumber) {
  const regex = /^\d{4}-\d{5}-[A-Za-z]{2}-\d$/;
  return regex.test(alumniNumber);
}

// Validate email format
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
  return regex.test(email);
}