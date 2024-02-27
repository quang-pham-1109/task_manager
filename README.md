# Task Management

## Overview

The task manager is essentially a Jirra clone with a bit of tweak in terms of designs and aesthetics This README provides essential information to get started with the project.
This is the front-end repository of the application, our backend can be found [here](https://github.com/quang-pham-1109/task_manager_server)

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)

## Features

- Full CRUD functionality for projects, users, tags, stages, tickets, and comments.
- Secure authentication using JSON Web Tokens (JWT).
- Robust request validation using Zod.
- Scalable and flexible MongoDB as the database backend.

## Prerequisites

Before you begin, ensure you have the following prerequisites:

- Node.js: [Install Node.js](https://nodejs.org/)
- Yarn: [Install Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable)

## Installation

1. Clone the repository:

 ```bash
 git clone ttps://github.com/quang-pham-1109/task_manager.git
```
   
2. Install dependencies:

```bash
cd task_manager
yarn install
```

3. Run the project:

```bash
yarn run dev
```

