/// <reference types="cypress" />

describe("Test with backend", () => {
  // https://conduit-api.bondaracademy.com/api/tags
  beforeEach("login to application", () => {
    cy.intercept(
      { method: "Get", path: "tags" }, // 如果用 path: 這就是簡化後的網址路徑，如果要用完整路徑，就用 url: (也可以用 path: "**/tags")
      {
        fixture: "tags.json",
      }
    );
    cy.loginToApplication();
  });

  it("verify correct request and response", () => {
    cy.intercept(
      "POST",
      "https://conduit-api.bondaracademy.com/api/articles/"
    ).as("postArticles");

    cy.contains("New Article").click();
    cy.get('[formcontrolname="title"]').type(
      `This is a title ${Math.random()}`
    );
    cy.get('[formcontrolname="description"]').type("This is a description");
    cy.get('[formcontrolname="body"]').type("This is a body of the article");
    cy.contains("Publish Article").click();

    cy.wait("@postArticles").then((xhr) => {
      console.log(xhr);
      expect(xhr.response.statusCode).to.equal(201);
      expect(xhr.request.body.article.body).to.equal(
        "This is a body of the article"
      );
      expect(xhr.response.body.article.description).to.equal(
        "This is a description"
      );
    });

    cy.contains("Delete Article").click();
  });

  it("intercepting and modifying the request and response", () => {
    // 攔截請求
    // cy.intercept(
    //   "POST",
    //   "https://conduit-api.bondaracademy.com/api/articles/",
    //   (req) => {
    //     req.body.article.description = "This is a description 2";
    //   }
    // ).as("postArticles");

    // 攔截回應
    cy.intercept(
      "POST",
      "https://conduit-api.bondaracademy.com/api/articles/",
      (req) => {
        req.reply((res) => {
          expect(res.body.article.description).to.equal(
            "This is a description" // 我輸入的沒有2，所以預期回應的也沒有2
          );
          res.body.article.description = "This is a description 2";
        });
      }
    ).as("postArticles");

    cy.contains("New Article").click();
    cy.get('[formcontrolname="title"]').type(
      `This is a title ${Math.random()}`
    );
    cy.get('[formcontrolname="description"]').type("This is a description");
    cy.get('[formcontrolname="body"]').type("This is a body of the article");
    cy.contains("Publish Article").click();

    cy.wait("@postArticles").then((xhr) => {
      console.log(xhr);
      expect(xhr.response.statusCode).to.equal(201);
      expect(xhr.request.body.article.body).to.equal(
        "This is a body of the article"
      );
      expect(xhr.response.body.article.description).to.equal(
        "This is a description 2" // 因為我 req(request) 請求是用 "This is a description 2"，所以 expect 當然也要是 "This is a description 2"，即使我 type: "This is a description"
      );
    });

    // cy.contains("Delete Article").click();
  });

  it("verify popular tags are displayed", () => {
    cy.get(".tag-list")
      .should("contain", "cypress")
      .and("contain", "automation")
      .and("contain", "testing");
  });

  it("verify global feed likes count", () => {
    cy.intercept(
      "GET",
      "https://conduit-api.bondaracademy.com/api/articles/feed*",
      { articles: [], articlesCount: 0 } // 這是從瀏覽器: F12 > Network > Response 得知的
    );
    cy.intercept("GET", "https://conduit-api.bondaracademy.com/api/articles*", {
      fixture: "articles.json",
    });

    cy.contains("Global Feed").click();
    cy.get("app-article-list button").then((heartList) => {
      expect(heartList[0]).to.contain("1");
      expect(heartList[1]).to.contain("5");
    });

    cy.fixture("articles.json").then((file) => {
      const articleLink = file.articles[1].slug;
      file.articles[1].favoritesCount = 6;
      cy.intercept(
        "POST",
        "https://conduit-api.bondaracademy.com/api/articles/" +
          articleLink +
          "/favorite",
        file
      );

      cy.get("app-article-list button").eq(1).click().should("contain", "6");
    });
  });

  it("delete a new article in a global feed", () => {
    // 從 postman 請求 request
    // const userCredentials = {
    //   user: {
    //     email: "jcjchuhu2@gmail.com",
    //     password: "abcd1234",
    //   },
    // };

    const bodyRequest = {
      article: {
        title: "Request from API (請求)",
        description: "API testing is easy (才怪)",
        body: "Automation testing is cool (學習中)",
        tagList: [],
      },
    };

    cy.get("@token").then((token) => {
      cy.request({
        url: "https://conduit-api.bondaracademy.com/api/articles/",
        headers: { Authorization: "Token " + token },
        method: "POST",
        body: bodyRequest,
      }).then((response) => {
        expect(response.status).to.equal(201);
      });

      // 點擊 "Delete Article" 按鈕的動作
      cy.contains("Global Feed").click();
      cy.get(".preview-link").eq(0).click();
      cy.get(".article-actions").contains("Delete Article").click();

      // 驗證被刪除的文章，是否真的不存在文章列表的第一項裡
      cy.request({
        url: "https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0",
        headers: { Authorization: "Token " + token },
        method: "GET",
      })
        .its("body")
        .then((body) => {
          // console.log(body);
          expect(body.articles[0].title).not.to.equal(
            "Request from API (請求)"
          );
        });
    });
  });
});

// new URL: 請忽略舊的URL
// APP: https//conduit.bondaracademy.com
// API: https//conduit-api.bondaracademy.com
