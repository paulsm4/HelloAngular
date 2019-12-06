import { Component, OnInit } from '@angular/core';
import { ContactsService } from 'src/app/services/contacts.service';
import { Contact } from 'src/app/models/Contact';
import { Note } from 'src/app/models/Note';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-test-rest-api',
  templateUrl: './test-rest-api.component.html',
  styleUrls: ['./test-rest-api.component.css']
})
export class TestRestAPIComponent implements OnInit {
  restUrl: string;
  contacts: Contact[];

  constructor(private contactsService: ContactsService) {
    this.restUrl = ' http://localhost:53561/api/Contacts/';
   }

  ngOnInit() {
    this.contactsService.getContacts()
      .pipe(first())
      .subscribe(contacts => {
        this.contacts = contacts;
    });
  }
}
