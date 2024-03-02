const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

const GITHUB_API_BASE_URL = "https://api.github.com";

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Middleware to parse URL-encoded form bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send(`
      <html>
        <head>
          <title>GitHub Profile Viewer</title>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
          <style>
            body {
              background-color: #343a40;
              color: #adb5bd;
            }
            .container {
              margin-top: 50px;
            }
            label {
              color: #90ee90;
            }
            .btn-primary {
              background-color: #6c757d;
              border-color: #6c757d;
            }
            .btn-primary:hover {
              background-color: #5a6268;
              border-color: #545b62;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>GitHub Profile Viewer</h1>
            <form action="/profile" method="post">
              <div class="form-group">
                <label for="username">Enter GitHub Username:</label>
                <input type="text" class="form-control" id="username" name="username" required>
              </div>
              <button type="submit" class="btn btn-primary">View Profile</button>
            </form>
          </div>
        </body>
      </html>
    `);
});

async function fetchUserData(username) {
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE_URL}/users/${username}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error.message);
    throw error;
  }
}

async function fetchRepositoriesData(username) {
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE_URL}/users/${username}/repos`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching repositories data:", error.message);
    throw error;
  }
}

app.post("/profile", async (req, res) => {
  try {
    const { username } = req.body;
    console.log(username);

    if (!username) {
      return res.status(400).send("Username parameter is required.");
    }

    // Fetch user data
    const userData = await fetchUserData(username);
    const reposData = await fetchRepositoriesData(username);

    let html = `
      <html>
        <head>
          <title>${userData.login}</title>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootswatch/4.5.2/darkly/bootstrap.min.css">
          <style>
            body {
              color: #90ee90;
            }
            .container {
              margin-top: 50px;
            }
            .card {
              background-color: #495057;
              color: #adb5bd;
            }
            .btn-primary {
              background-color: #6c757d;
              border-color: #6c757d;
            }
            .btn-primary:hover {
              background-color: #5a6268;
              border-color: #545b62;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="row">
              <div class="col-md-3">
                <img src="${
                  userData.avatar_url
                }" alt="Profile Picture" style="max-width: 200px;" class="img-fluid rounded-circle mb-3">
              </div>
              <div class="col-md-9">
                <h1 class="mb-4">${userData.login}</h1>
                <h3>User Details</h3>
                <ul class="list-group mb-4">
                  <li class="list-group-item">Name: ${
                    userData.name || "Not provided"
                  }</li>
                  <li class="list-group-item">Bio: ${
                    userData.bio || "Not provided"
                  }</li>
                  <li class="list-group-item">Location: ${
                    userData.location || "Not provided"
                  }</li>
                  <li class="list-group-item">Followers: ${
                    userData.followers
                  }</li>
                  <li class="list-group-item">Following: ${
                    userData.following
                  }</li>
                  <li class="list-group-item">Public Repositories: ${
                    userData.public_repos
                  }</li>
                  <li class="list-group-item">Public Gists: ${
                    userData.public_gists
                  }</li>
                  <li class="list-group-item">Email: ${
                    userData.email || "Not provided"
                  }</li>
                  <li class="list-group-item">Company: ${
                    userData.company || "Not provided"
                  }</li>
                  <li class="list-group-item">Website/Blog: ${
                    userData.blog || "Not provided"
                  }</li>
                </ul>
              </div>
            </div>
            <h2>Repositories</h2>
            <div class="row">
    `;

    reposData.forEach((repo) => {
      html += `
              <div class="col-md-4">
                <div class="card mb-3">
                  <div class="card-body">
                    <h5 class="card-title">${repo.name}</h5>
                    <p class="card-text">${
                      repo.description || "No description provided"
                    }</p>
                    <a href="${
                      repo.html_url
                    }" class="btn btn-primary">Go to Repo</a>
                  </div>
                </div>
              </div>
      `;
    });

    html += `
            </div>
          </div>
        </body>
      </html>
    `;

    res.send(html);
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
