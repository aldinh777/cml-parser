# What is CML?
CML (Compacted Markup Language) is another attempt to compact html or xml document in general by triming anything as much as possible but still makes everything consistent and keep familiarities with usual html or xml tags

Here a sample CML code

```
div <
    h1 <This is Title>
    p <
        This is Paragraph br<>
        These are b<Bold> i<Italic> u<Underline> Text br<>
        These are b<i<u<Bolditalicunderline>>> Text br<>
    >
    button class="btn" type="button" <Press Me>
>

```
This is equal to html tag
```html
<div>
    <h1>This is Title</h1>
    <p>
        This is Paragraph <br/>
        These are <b>Bold</b> <i>Italic</i> <u>Underline</u> Text <br/>
        These are <b><i><u>Bolditalicunderline</u></i></b> Text <br/>
    </p>
    <button class="btn" type="button">Press Me</button>
</div>
```
This inovation successfully reduce almost half the size of the real html document!!!
