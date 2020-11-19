document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  
  document.querySelector('#compose')
  .addEventListener('click', () => compose_email({
    "recipients": '',
    "subject": '',
    "body": '',
    "reply_flag": false
  }));

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(email_filling) {
  // The parameter email_filling defines whats gonna be the pre-filled e-mail fields
  // and also a flag that indicates if the e-mail being composed it's a reply or 
  // a brand new e-mail

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Putting those elements in variables because they are gonna be used later on
  let recipients_input = document.querySelector('#compose-recipients');
  let subject_input = document.querySelector('#compose-subject');
  let body_textarea = document.querySelector('#compose-body');

  // Clear out composition fields or fill up with content for a reply
  recipients_input.value = email_filling.recipients;
  subject_input.value = email_filling.subject;
  body_textarea.value = email_filling.reply_flag ? `\n${email_filling.body}\n` : '';

  // If the submit button is hit, then sends the e-mail
  document.querySelector('#compose-form').onsubmit = () => {

    // if the fetch is successful then the response variable is gonna contain the 
    // data returned from the API. 'then' is gonna return that data in json format 
    // which will be in the result variable (return message from the API)
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients_input.value,
          subject: subject_input.value,
          body: body_textarea.value
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log(result); // printing API message to console
      load_mailbox('sent');
    });

    return false;
  };
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Query for all e-mails that are in the mailbox given
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    let ul = document.createElement('ul');
    ul.className = 'list-group';

    emails.forEach((email) => {
      let a = document.createElement('a');
      a.href = '#';
      a.addEventListener('click', () => {
        // It marks the given e-mail as 'read' if it's the first time it's being open
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })
        .then(() => {
          load_email(email.id, mailbox);
        });
      });

      if(email.read === false)
        a.className = 'list-group-item list-group-item-action';
      else
        a.className = 'list-group-item list-group-item-action list-group-item-secondary';

      a.innerHTML = `
      <div class="container">
        <div class="row">
          <div class="col">
            <strong>${email.sender}</strong>
          </div>
          <div class="col">
            <div class="d-flex justify-content-center">
              ${email.subject}
            </div>
          </div>
          <div class="col">
            <div class="d-flex justify-content-end">
              ${email.timestamp}
            </div>
          </div>
        </div>
      </div>`;
      ul.append(a);
    });

    document.querySelector('#emails-view').append(ul);
  });
}

function load_email(email_id, mailbox) {
  // First, clean any mail that is appended to the 'email-view' div
  if(document.querySelector('.card') != null)
    document.querySelector('.card').remove();

  // Show the mailbox and hide other views
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    // Creating card that is gonna contain the e-mail
    const card_div = document.createElement('div');
    card_div.className = 'card';

    // Creating e-mail
    // Notice that the body has it's '\n' replaced by <br> since it's html
    card_div.innerHTML = `
    <div class="card-header">
      ${email.subject}
    </div>
    <div id="email_card" class="card-body">
      <p class="card-text"><strong>From: </strong>${email.sender}</p>
      <p class="card-text"><strong>To: </strong>${email.recipients}</p>
      <p class="card-text"><small class="text-muted">${email.timestamp}</small></p>
      <hr>
      <p class="card-text">${email.body.replace(/\n/g, '<br>')}</p>
    </div>`;
    
    document.querySelector('#email-view').append(card_div);
    
    // Creating archive e reply button elements to be appended to the e-mail created
    if (mailbox != 'sent')
    {
      // Creating archive button
      let archive_unarchive_btn = document.createElement('a');
      archive_unarchive_btn.innerHTML = email.archived ? 'Unarchive' : 'Archive';
      archive_unarchive_btn.className = 'btn btn-outline-warning';
      archive_unarchive_btn.href = '#';
      
      // And adding a click event listener to it
      archive_unarchive_btn.addEventListener('click', function() {
        fetch(`/emails/${email_id}`, {
          method: 'PUT',
          body: JSON.stringify({
              // if the e-mail is archived then we want to unarchive and vice-versa
              archived: email.archived ? false : true 
          })
        })
        .then(() => {
          load_mailbox('inbox'); // Go to the inbox
        });
      });

      // Creating reply button
      let reply_btn = document.createElement('a');
      reply_btn.innerHTML = 'Reply';
      reply_btn.className = 'btn btn-outline-success';
      reply_btn.id = 'reply_btn';
      reply_btn.href = '#';

      reply_btn.addEventListener('click', () => compose_email({
        "recipients": email.sender,
        "subject": email.subject.match(/(^Re:)+/) === null ? `Re: ${email.subject}` : `${email.subject}`, 
        "body": `---\nOn ${email.timestamp} ${email.sender} wrote:\n${email.body}`,
        "reply_flag": true
      }));

      // Appending the buttons to the e-mail
      let email_card_div = document.getElementById('email_card');
      email_card_div.append(reply_btn);
      email_card_div.append(archive_unarchive_btn);
    }
  });
}
