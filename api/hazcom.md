 "/api/hazcom/chemical": {
      "post": {
        "tags": [
          "HazCom"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ChemicalDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ChemicalDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ChemicalDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "get": {
        "tags": [
          "HazCom"
        ],
        "parameters": [
          {
            "name": "pageNumber",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 1
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 10
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/hazcom/chemical/{id}": {
      "get": {
        "tags": [
          "HazCom"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "delete": {
        "tags": [
          "HazCom"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/hazcom/chemical/drafts": {
      "get": {
        "tags": [
          "HazCom"
        ],
        "parameters": [
          {
            "name": "pageNumber",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 1
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 10
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/hazcom/chemical/published": {
      "get": {
        "tags": [
          "HazCom"
        ],
        "parameters": [
          {
            "name": "pageNumber",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 1
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 10
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/hazcom/chemical/names": {
      "get": {
        "tags": [
          "HazCom"
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/hazcom/sds": {
      "post": {
        "tags": [
          "HazCom"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/SafetyDataSheetDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/SafetyDataSheetDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/SafetyDataSheetDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "get": {
        "tags": [
          "HazCom"
        ],
        "parameters": [
          {
            "name": "pageNumber",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 1
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 10
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/hazcom/sds/{id}": {
      "get": {
        "tags": [
          "HazCom"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "delete": {
        "tags": [
          "HazCom"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/hazcom/sds/{id}/statements": {
      "get": {
        "tags": [
          "HazCom"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/hazcom/sds/{id}/label": {
      "get": {
        "tags": [
          "HazCom"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/hazcom/sds/{id}/statements/pdf": {
      "get": {
        "tags": [
          "HazCom"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/hazcom/hazard-hcode": {
      "post": {
        "tags": [
          "HazCom"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/HazardHCodeDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/HazardHCodeDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/HazardHCodeDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "get": {
        "tags": [
          "HazCom"
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/hazcom/precautionary-code": {
      "post": {
        "tags": [
          "HazCom"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/PrecautionaryCodeDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/PrecautionaryCodeDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/PrecautionaryCodeDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "get": {
        "tags": [
          "HazCom"
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/hazcom/training": {
      "post": {
        "tags": [
          "HazCom"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/TrainingLogDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/TrainingLogDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/TrainingLogDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "get": {
        "tags": [
          "HazCom"
        ],
        "parameters": [
          {
            "name": "pageNumber",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 1
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 10
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/hazcom/training/{id}": {
      "get": {
        "tags": [
          "HazCom"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "put": {
        "tags": [
          "HazCom"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateTrainingLogDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateTrainingLogDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateTrainingLogDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/hazcom/risk-assessment": {
      "post": {
        "tags": [
          "HazCom"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ChemicalRiskAssessmentDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ChemicalRiskAssessmentDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ChemicalRiskAssessmentDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "get": {
        "tags": [
          "HazCom"
        ],
        "parameters": [
          {
            "name": "pageNumber",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 1
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 10
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },
    "/api/hazcom/risk-assessment/{id}": {
      "get": {
        "tags": [
          "HazCom"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      },
      "put": {
        "tags": [
          "HazCom"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ChemicalRiskAssessmentDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ChemicalRiskAssessmentDto"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ChemicalRiskAssessmentDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    },