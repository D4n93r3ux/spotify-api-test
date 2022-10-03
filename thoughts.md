Step One:
Create a button that can make an authorization
request to Spotify.

Step Two:
Check for the URL encoded code and capture it. Use useEffect to execute a
function when the component loads.

Step Three:
When we get the code, redeem it for an access_token. Watch out for React's
StrictMode bullshit rendering each component twice and ensure that the code is
removed from the URL synchcronously so that we don't accidentally try to redeem
it with Spotify twice, generating an error. Store the access_token and
refresh_token in local storage.

Step Four:

Puzzle.

We have the codes in local storage.

If we're going to use the codes with our API tool, we'll need to pass them?

But it's annoying to pass access tokens every time... can we do it once?

That means including them in the constructor.

That's certainly neater... but what if they're absent?

Suppose we have an access code in the API tool, but it expires before we re-render?

We need to check the validity of the access token before we make any API calls.

In fact... we need to check the validity of the access token as we make an API call.

An API call could fail because the access token is expired.

I need to iterate.

First and simplest is to pass the access_token to the method directly.

Okay - let's do it wrong a few times. That's a good way to learn.

Okay... so we can grab the token out of local storage. That's ugly and repetitive.

We could have the class check local storage itself???

We can't keep getting new codes... that's why we need to persist the access and
refresh tokens. So local storage is kinda necessary?

When do we check the validity of our token?

We might want to re-render our app if our token is invalid? And we erase the token.

There are many moving parts here.

Let's try and clarify.

We have:
- local storage
- state
- instance properties
- closures / variables outside of function component definition
- useRef (persistent, mutable, non-rerendering 'state')

I am going mad.

Read for a bit.

Okay...

From Google Keep:

The final piece of the puzzle - how do we persist, check for, verify and use the tokens we have obtained?

Persistence between sessions must be via local storage, although ideally they would be encrypted.

Checking local storage... could be done in the component when rendered and captured to state, or the class each time an API call is made... but if we find a token to be faulty, we will need to update our connection button... so it seems like we should check in the component.

Verification... we can make an API call to test the token, but what do we do if the token doesn't work? Then we try the refresh token? If that succeeds and we're storing the token in state, it'll trigger a rerender... 

Okay, state represents the verification that we have working tokens.

We store the tokens outside the component.

...

Alright, so now we're at the problem of what to do if the access_token needs to be refreshed.

First of all... when do we find out that the access_token isn't valid?
Currently it's when we're trying to make an API call.
First of all... let's just figure out how we refresh the token.

We make another API call (let's assume we have the refresh token).

When we get the access_token, we want to persist it. Presently, we're doing our persistance in the component.

Does that make sense?

Maybe not.

Why not?

Because... if we discover that our access_token is invalid while making an API
call, that API call will fail... and in order to recover smoothly, we need to
refresh the token. When we refresh the token, we want to persist it, but to do
so whilst recovering smoothly means that this should be done from within the
class, not the component.

Interesting. So... the class should be responsible for interacting with local storage.

Yikes. Okay.

So... let's try this:

When we fetch the tokens, we'll store the tokens in local storage if we find them.

Then we'll remove those storage statements from the component.

...

We seem to have learned to let the service class handle token persistence,
because when it becomes necessary to refresh a token, we want to do so without
first having to return some kind of error to the component using the service.
It's neater to wrap persistence up in the class. Encapsulation. Separation of
concerns. What wasn't apparent to me was that token persistence might be a
concern of the service.

It's still not wholly clear to me exactly why this should be the case. No doubt
the accumulation of practical experience will cement the gut feeling, but I
would like to be able to say explicitly why this is the case. Perhaps it would
help to try and teach someone... and in doing so, allow my feeling brain to
educate my verbal brain.

We have made progress.

Next achievement... embed the web player and create a button that switches to
it and plays a particular track.

But first, shopping.
