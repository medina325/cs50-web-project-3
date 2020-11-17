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
  document.querySelector('#email-view').style.display = 'none';

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
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Query for all e-mails that are in the mailbox given
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails);
    
    const ul = document.createElement('ul');
    ul.className = 'list-group';

    // const header_div = document.createElement('div');
    // header_div.className = 'list-group-item';
    // header_div.innerHTML = '<div class="container"><div class="row"><div class="col"><div class="d-flex justify-content-center">Sender</div></div><div class="col"><div class="d-flex justify-content-center">Subject</div></div><div class="col"><div class="d-flex justify-content-center">Date</div></div></div></div>';
    // ul.append(header_div);

    emails.forEach((email) => {
      const a = document.createElement('a');
      a.href = '#';
      a.addEventListener('click', () => {
        load_email(email.id, mailbox);
      });

      if(email.read === false)
        a.className = 'list-group-item list-group-item-action';
      else
        a.className = 'list-group-item list-group-item-action list-group-item-dark';

      a.innerHTML = `
      <div class="container">
        <div class="row">
          <div class="col">
            ${email.sender}
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
  // First, it marks the e-mail given as 'read'
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })

  // Next, clean any mail that is appended to the 'email-view' div
  if (document.querySelector('.card') != null)
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

    // Creating e-mail that belong to either received or archived mailbox

    // The code below gets confusing because of the "excessive" use of ternary operator to check if e-mail
    // belongs to the sent mailbox or not, to create the Archive button or not
    card_div.innerHTML = `
    <div class="card-header">
      ${email.subject}
    </div>
    <div class="card-body">
      <p class="card-text"><strong>From: </strong>${email.sender}</p>
      <p class="card-text"><small class="text-muted">${email.timestamp}</small></p>
      <p class="card-text"><strong>To: </strong>${email.recipients}</p>
      <hr>
      <p class="card-text">${email.body}</p>`
        + (mailbox === 'sent' ? 
    `</div>`
        : (email.archive ? 
    ` <a href="#" id="unarchive-btn" class="btn btn-outline-warning">Unarchive</a>
    </div>
    `   : 
    ` <a href="#" id="archive-btn" class="btn btn-outline-warning">Archive</a>
    </div>`
        ));
    
    document.querySelector('#email-view').append(card_div);

    // Adding event listener to Archive button
  });
}
