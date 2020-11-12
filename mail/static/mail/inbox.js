document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // If the submit button is hit, then sends the e-mail
  document.querySelector('#compose-form').onsubmit = () => {

    // if the fetch is successful then the response variable is gonna contain the data returned from the API
    // 'then' is gonna return that data in json format which will be in the result variable
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log(result);
    });

    load_mailbox('sent');

    return false;
  };
  
}

function load_mailbox(mailbox) {
  console.log(mailbox);
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Query for all e-mails that are in the mailbox given
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails);
    
    const ul = document.createElement('ul');
    ul.className = 'list-group';

    emails.forEach((email) => {
      const a = document.createElement('a');
      a.href = '#';
      
      if(email.read === false)
        a.className = 'list-group-item list-group-item-action';
      else
        a.className = 'list-group-item list-group-item-action disabled';

      a.innerHTML = email.subject + " " + email.sender + email.timestamp;
      document.querySelector('#emails-view').append(a);
    });
    


  });
}
