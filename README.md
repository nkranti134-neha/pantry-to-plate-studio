# Pantry To Plate Studio

def generate_recipe(ingredients, cuisine, diet):

    """

    generate a recipe using ingredients provided.

      cuisine can be "italian","Mexican","Indian","Any",etc.

        diet can be "Veg","non_Veg","jain","Any",etc.

        """

    

    prompt = f"""

    Generate a recipe using these ingredients: {', '.join(ingredients)}

    The recipe should not be more than 100 words.

    Cuisine: {cuisine}

    Diet: {diet}

    """

    response = client.models.generate_content(

        model="gemini-3.6-flash",

        contents=prompt

    )

    print(response.text)       create a recipe generating aap

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pantry-to-plate-studio.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/228de485-742e-5650-813c-0bdaaae1946b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
