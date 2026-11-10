# DB Craft

DB Craft is a web application designed to simplify the creation of database diagrams. Built using
Nuxt.js and TypeScript, DB Craft offers an intuitive interface for developers and database
architects to visualize and design their database schemas.

## Features

- **Interactive Diagram Creation**: Drag and drop tables, columns, and relationships to design your
  database schema.
- **Export Options**: Export diagrams as SQL or PNG for easy integration and sharing.
- **Integration**: Connect with databases like PostgreSQL and MySQL for schema import/export.
- **Responsive Design**: Optimized for desktop and mobile for seamless designing on the go.
- **Live Team Editing**: Edit team diagrams together with shared cursors, avatars, conflict merging,
  and automatic saving.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 20.19+ or 22.12+ (Node 24 LTS recommended)
- yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/maks-kovpak/db-craft.git
   ```

2. Navigate to the project directory:

   ```bash
   cd db-craft
   ```

3. Install dependencies:

   ```bash
   yarn install
   ```

4. Set up environment variables:

   Create a `.env` file in the root directory and add necessary environment variables (e.g.,
   database connection strings, API keys).

5. Run the development server:

   ```bash
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## Tutorial documentation

The public `/tutorial` page uses Nuxt Content for searchable, sectioned Markdown guides with
screenshots and captioned videos in English. The `tutorial` collection is defined in
`content.config.ts`. Edit the articles in `content/tutorial/`; see
[the authoring guide](content/TUTORIAL.md) for media conventions, coverage, and validation.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
