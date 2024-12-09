
# Strapi Helper

**Strapi Helper** is an interactive CLI tool designed to simplify the creation of Strapi files based on frontend configurations. This tool provides an easy-to-use menu for generating required files step by step.

## Features

-   **Generate `frontend-sections.json`:** Automatically create a configuration file based on your React project structure.
-   **Generate Strapi controllers and APIs:** Use the generated `frontend-sections.json` to create Strapi controllers, services, and routes.

## Installation

Install the tool globally using npm:

`npm install -g strapi-helper` 

## Usage

1.  Navigate to your Strapi project directory:
    
    `cd /path/to/your-strapi-project` 
    
2.  Run the helper command:
    
    `strapi-helper` 
    
3.  Follow the interactive menu to:
    
    -   Generate the `frontend-sections.json` file.
    -   Generate Strapi controllers, services, and routes.

### Menu Options

When you run `strapi-helper`, you’ll see the following options:

-   **1️⃣ Generate `frontend-sections.json`**  
    Parse your React project to generate the required configuration file.
    
-   **2️⃣ Generate Strapi controllers**  
    Use the `frontend-sections.json` file to create Strapi controllers, services, and routes.
    
-   **0️⃣ Exit**  
    Exit the interactive menu.
    

----------

## Example Workflow

1.  Run the helper and select option `1`:
    
    -   Enter your project name and the path to your React project.
    -   The `frontend-sections.json` file is generated in the current directory.
2.  Select option `2` to generate Strapi files:
    
    -   Ensure `frontend-sections.json` is present.
    -   The tool will create all required Strapi files.
3.  Done! 🎉
    

----------

## Contributing

If you'd like to contribute to **Strapi Helper**, feel free to fork the repository and submit a pull request.

----------

## License

This project is licensed under the MIT License. See the LICENSE file for details.