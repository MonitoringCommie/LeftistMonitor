"""
OpenAPI Documentation Configuration

Provides enhanced API documentation with examples and descriptions.
"""

from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi


def custom_openapi(app: FastAPI):
    """Generate custom OpenAPI schema with enhanced documentation."""
    
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="LeftistMonitor API",
        version="2.0.0",
        description="""
# LeftistMonitor API

A comprehensive API for accessing historical data about liberation struggles, 
progressive movements, and people's history.

## Features

- **Search**: Full-text search across 430,000+ records
- **GeoJSON**: Geographic data for mapping
- **Contributions**: Community-submitted historical data
- **Discussions**: Threaded comments on historical records
- **Export**: Download data in CSV, PDF, and JSON formats

## Authentication

Most endpoints require JWT authentication. Obtain a token via `/auth/login`.

```
Authorization: Bearer <your-token>
```

## Rate Limiting

| Tier | Limit |
|------|-------|
| Auth | 10/min |
| Search | 30/min |
| API | 120/min |

## Support

For issues or feature requests, visit our 
[GitHub repository](https://github.com/leftistmonitor/leftistmonitor).
        """,
        routes=app.routes,
        tags=[
            {
                "name": "auth",
                "description": "Authentication and authorization endpoints"
            },
            {
                "name": "search",
                "description": "Full-text search across all data"
            },
            {
                "name": "people",
                "description": "Historical figures and activists"
            },
            {
                "name": "events",
                "description": "Historical events, protests, and movements"
            },
            {
                "name": "geojson",
                "description": "Geographic data for mapping"
            },
            {
                "name": "contributions",
                "description": "Community-submitted data"
            },
            {
                "name": "discussions",
                "description": "Comments and discussions"
            },
            {
                "name": "export",
                "description": "Data export endpoints"
            },
            {
                "name": "health",
                "description": "Health check endpoints"
            },
            {
                "name": "monitoring",
                "description": "Metrics and analytics endpoints"
            }
        ]
    )
    
    # Add security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "bearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "JWT token obtained from /auth/login"
        }
    }
    
    # Add example responses
    openapi_schema["components"]["examples"] = {
        "EventExample": {
            "value": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "Haymarket Affair",
                "description": "Labor protest and bombing in Chicago",
                "date_start": "1886-05-04",
                "location": {
                    "name": "Haymarket Square, Chicago",
                    "latitude": 41.8868,
                    "longitude": -87.6473,
                    "country_code": "USA"
                },
                "categories": ["labor", "protest", "martyrdom"],
                "death_toll": 11,
                "participants": 3000
            }
        },
        "PersonExample": {
            "value": {
                "id": "550e8400-e29b-41d4-a716-446655440001",
                "name": "Emma Goldman",
                "birth_date": "1869-06-27",
                "death_date": "1940-05-14",
                "nationality": "Lithuanian-American",
                "occupation": ["Anarchist", "Writer", "Activist"],
                "biography": "Emma Goldman was an anarchist political activist and writer..."
            }
        },
        "ContributionExample": {
            "value": {
                "contribution_type": "event",
                "data": {
                    "title": "Battle of Blair Mountain",
                    "description": "Largest labor uprising in US history...",
                    "date_start": "1921-08-25",
                    "location_name": "Logan County, West Virginia"
                },
                "sources": [
                    {
                        "type": "academic",
                        "title": "The Battle of Blair Mountain",
                        "author": "Robert Shogan"
                    }
                ]
            }
        },
        "ErrorExample": {
            "value": {
                "detail": "Not found",
                "status_code": 404
            }
        },
        "ValidationErrorExample": {
            "value": {
                "detail": [
                    {
                        "loc": ["body", "title"],
                        "msg": "field required",
                        "type": "value_error.missing"
                    }
                ]
            }
        }
    }
    
    # Add common response schemas
    openapi_schema["components"]["schemas"]["PaginatedResponse"] = {
        "type": "object",
        "properties": {
            "items": {
                "type": "array",
                "items": {}
            },
            "total": {
                "type": "integer",
                "description": "Total number of items"
            },
            "page": {
                "type": "integer",
                "description": "Current page number"
            },
            "page_size": {
                "type": "integer",
                "description": "Items per page"
            },
            "pages": {
                "type": "integer",
                "description": "Total number of pages"
            }
        }
    }
    
    openapi_schema["components"]["schemas"]["HealthResponse"] = {
        "type": "object",
        "properties": {
            "status": {
                "type": "string",
                "enum": ["healthy", "degraded", "unhealthy"]
            },
            "timestamp": {
                "type": "string",
                "format": "date-time"
            },
            "version": {
                "type": "string"
            },
            "components": {
                "type": "object"
            }
        }
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema


# API endpoint examples for documentation
API_EXAMPLES = {
    "search": {
        "basic": {
            "summary": "Basic search",
            "description": "Search for events related to labor movements",
            "value": {
                "query": "labor strike",
                "type": "event",
                "limit": 20
            }
        },
        "advanced": {
            "summary": "Advanced search with filters",
            "description": "Search with date range and location filters",
            "value": {
                "query": "revolution",
                "type": "event",
                "date_from": "1900-01-01",
                "date_to": "1950-12-31",
                "country": "RUS",
                "limit": 50
            }
        }
    },
    "contribution": {
        "event": {
            "summary": "Submit an event",
            "description": "Submit a historical event for review",
            "value": {
                "contribution_type": "event",
                "data": {
                    "title": "Triangle Shirtwaist Factory Fire",
                    "description": "Industrial disaster that killed 146 garment workers...",
                    "date_start": "1911-03-25",
                    "location_name": "New York City",
                    "latitude": 40.7308,
                    "longitude": -73.9973,
                    "country_code": "USA",
                    "death_toll": 146,
                    "categories": ["labor", "industrial disaster"]
                },
                "sources": [
                    {
                        "type": "academic",
                        "title": "Triangle: The Fire That Changed America",
                        "author": "David Von Drehle",
                        "url": "https://example.com/book"
                    }
                ],
                "language": "en"
            }
        },
        "correction": {
            "summary": "Submit a correction",
            "description": "Correct an error in existing data",
            "value": {
                "contribution_type": "correction",
                "data": {
                    "entity_type": "event",
                    "entity_id": "550e8400-e29b-41d4-a716-446655440000",
                    "field_name": "death_toll",
                    "current_value": "10",
                    "proposed_value": "11",
                    "reason": "Recent historical research has confirmed an additional victim"
                },
                "sources": [
                    {
                        "type": "academic",
                        "title": "New Research Paper",
                        "url": "https://example.com/paper"
                    }
                ]
            }
        }
    },
    "discussion": {
        "create_thread": {
            "summary": "Start a discussion",
            "description": "Create a new discussion thread about an event",
            "value": {
                "entity_type": "event",
                "entity_id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "Discussion: Sources for Haymarket Affair",
                "initial_comment": "I'm researching the Haymarket Affair and looking for primary sources...",
                "tags": ["research", "sources", "labor-history"]
            }
        },
        "create_comment": {
            "summary": "Add a comment",
            "description": "Add a comment to an existing thread",
            "value": {
                "content": "The Chicago History Museum has an excellent collection of primary sources...",
                "parent_id": None
            }
        }
    }
}
