import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  rForm: FormGroup;
  post:any;                     // A property for our submitted form
  to:string = '';
  cc:string = '';
  bcc:string = '';
  subject:string = '';
  text:string = '';
  response:string = 'Attempting to Send.....';
  flag:boolean = false;

  constructor(private fb: FormBuilder, public http: Http) {
    this.rForm = fb.group({
      'to' : [null, Validators.required],
      'cc' : [null],
      'bcc' : [null],
      'subject' : [null, Validators.required],
      'text' : [null, Validators.required]
    });
    this.http = http;
  }

  addPost(post) {
   console.log('api Call');
   this.flag = true;
   var payload = {
     debug: true,
     subject: post.subject,
     text: post.text
   };

   //Create recipient arrays if required.
   if (post.to) {
     payload['to']= post.to.indexOf(',') > 0 ? post.to.replace(/ /g, '').split(",") : [ post.to.replace(/ /g, '') ];
   }
   if (post.cc) {
     payload['cc'] = post.cc.indexOf(',') > 0 ? post.cc.replace(/ /g, '').split(",") : [ post.cc.replace(/ /g, '') ];
   }
   if (post.bcc) {
     payload['bcc'] = post.bcc.indexOf(',') > 0 ? post.bcc.replace(/ /g, '').split(",") : [ post.bcc.replace(/ /g, '') ];
   }

   this.http.post('/api', payload).map((res) => {
     res.json();
     this.response = JSON.parse(res["_body"])["status"];
     console.log('res',res);
   }).subscribe((data) => {
     console.log('Subscribe');
   });
  }
}
