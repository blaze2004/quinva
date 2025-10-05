Hmm...

The idea is to build something similar to splitwise but simpler. 
A web app would be perfect for the usecase (also it's easier to share). 

As I have already worked a lot on Next.js, so I decided to go with it as the app dir allows to build both the api as well as the frontend pages in the same app.

For linter, I choose biome for reasons mentioned in this [reddit post](https://www.reddit.com/r/nextjs/comments/1cnsvhf/comment/lr1qi97/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button). Honestly I also had a bad experience from the v8 to v9 transition in eslint, so i think its a good time to try biome.

I prefer typescript as it makes dedugging easier, and tailwind is go to choice because of it's ease of use and simplicity.


Shadcn/ui is the best Ui library out there (not really a ui library though).

For auth building a simple username/password login is easy but other requirements like email verification, session management, and possibly extending to add more auth options in future would become tedius, so I decided to go with betterauth, as its the most comprehensive auth system for typescript and super simple and easy to setup but highly extensible and customizable as well. (I want this project to be useful, so keeping it secure is a must.)

