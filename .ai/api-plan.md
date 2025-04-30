# REST API Plan

## 1. Resources

1. **Users**
   - Database Table: `users`
   - Description: Managed by Supabase Auth. Contains user information including email, encrypted_password, and creation timestamps. This resource is used for authentication and account management.

2. **Flashcards**
   - Database Table: `flashcards`
   - Fields: id, user_id, front (max 200 characters), back (max 500 characters), source (must be one of 'ai-full', 'ai-edited', or 'manual'), is_deleted (boolean), generation_id (optional foreign key), created_at, updated_at.
   - Description: Core educational content used for study sessions. Supports manual creation and AI-generated proposals.

3. **Sessions**
   - Database Table: `sessions`
   - Description: Records user sessions. Can be leveraged to log study sessions or activity, though the primary study session functionality might be constructed by combining flashcards with spaced repetition logic.

4. **Generations**
   - Database Table: `generations`
   - Description: Log table for AI flashcard generation events. Recorded information includes model details, counts of generated and accepted flashcards, source text properties, and timing.

5. **Generation Error Logs**
   - Database Table: `generation_error_logs`
   - Description: Log table for errors encountered during AI flashcard generation, including error messages, details, and associated source text information.

## 2. API Endpoints

### Flashcards Endpoints

- **List Flashcards**
  - **Method:** GET
  - **URL:** /api/flashcards
  - **Description:** Retrieve a paginated list of flashcards for the authenticated user.
  - **Query Parameters:**
    - page (optional): Page number
    - pageSize (optional): Number of items per page (default: 10, max: 100)
    - sortBy (optional): Field to sort by (e.g., created_at)
    - filter (optional): Filter by fields such as source
  - **Response (200):**
    ```json
    {
      "data": [
        { 
          "id": "uuid", 
          "front": "...", 
          "back": "...", 
          "source": "one of ['ai-full', 'ai-edited', 'manual']",
          "generation_id": "number | null",
          "created_at": "timestamp", 
          "updated_at": "timestamp" 
        }
      ],
      "pagination": { 
        "page": 1, 
        "pageSize": 10, 
        "total": 50 
      }
    }
    ```
  - **Errors:**
    - 401 Unauthorized if the user is not authenticated

- **Retrieve Flashcard**
  - **Method:** GET
  - **URL:** /api/flashcards/:id
  - **Description:** Get detailed information of a single flashcard by ID (must belong to the authenticated user).
  - **Response (200):**
    ```json
    { "id": "uuid", "front": "...", "back": "...", "source": "one of ['ai-full', 'ai-edited', 'manual']", "generation_id": null, "created_at": "timestamp", "updated_at": "timestamp" }
    ```
  - **Errors:**
    - 401 Unauthorized
    - 404 Not Found

- **Create Flashcards**
  - **Method:** POST
  - **URL:** /api/flashcards
  - **Description:** Create one or more flashcards. Can be used for manual creation or for saving AI-generated flashcards (both 'ai-full' and 'ai-edited') after user review.
  - **Request Payload:**
    ```json
    {
      "flashcards": [
        {
          "front": "string (max 200 characters)",
          "back": "string (max 500 characters)",
          "source": "one of ['ai-full', 'ai-edited', 'manual']",
          "generation_id": "number or null (required for ai-full and ai-edited, null for manual)"
        }
      ]
    }
    ```
  - **Response (201):**
    ```json
    {
      "flashcards": [
        { "id": "uuid", "front": "...", "back": "...", "source": "...", "generation_id": null, "created_at": "timestamp", "updated_at": "timestamp" }
      ]
    }
    ```
    **Validations**:
    - `front` maximum length: 200 characters.
    - `back` maximum length: 500 characters.
    - `source`: Must be one of `ai-full`, `ai-edited`, or `manual`.
  - **Errors:**
    - 400 Bad Request for invalid payloads
    - 401 Unauthorized

- **Update Flashcard**
  - **Method:** PUT
  - **URL:** /api/flashcards/:id
  - **Description:** Update an existing flashcard (only if it belongs to the authenticated user).
  - **Request Payload (partial or full update):**
    ```json
    {
      "front": "updated string",
      "back": "updated string",
      "source": "ai-edited"
    }
    ```
  - **Response (200):** Updated flashcard data in JSON
  - **Errors:**
    - 400 Bad Request
    - 401 Unauthorized
    - 404 Not Found
  - **Validations**:
    - `front` maximum length: 200 characters.
    - `back` maximum length: 500 characters.
    - `source`: Must be one of `ai-full`, `ai-edited`, or `manual`.
    - `generation_id`: Cannot be updated through this endpoint.

- **Delete Flashcard**
  - **Method:** DELETE
  - **URL:** /api/flashcards/:id
  - **Description:** Soft-delete a flashcard by setting the is_deleted flag to true (ensuring the flashcard belongs to the authenticated user).
  - **Response (204):** No content
  - **Errors:**
    - 401 Unauthorized
    - 404 Not Found

    

- **Generate Flashcard Proposals (AI Generation)**
  - **Method:** POST
  - **URL:** /api/generate
  - **Description:** Submit raw text to the AI service to generate flashcard proposals. The proposals are returned to the client for review but are not automatically persisted.
  - **Request Payload:**
    ```json
    {
      "sourceText": "string (text input for generation, length validated between 1000 and 10000 if applicable)"
    }
    ```
  - **Response (200):**
    ```json
    {
      "generation_id": 123,
      "flashcardsProposals": [
        { "front": "generated front text", "back": "generated back text", "source": "ai-full" }
      ],
      "generated_count": 5
    }
    ```
    **Business Logic**:
    - Validate that `source_text` length is between 1000 and 10000 characters.
    - Call the AI service to generate flashcards.
    - Store the generation metadata and associate generated flashcards.
  - **Errors:**
    - 400 Bad Request for invalid input text
    - 401 Unauthorized
    - 500 Internal Server Error if AI service fails (logs recorded in `generation_error_logs`).


  - **Method:** GET
  - **URL:** /api/generate/{id}
  - **Description**: Retrieve detailed information of a specific generation including its flashcards.
  - **Response JSON**: Generation details and associated flashcards.
  - **Errors**: 404 Not Found.
  
### Account and User Endpoints

*(Note: Most authentication and account management are handled via Supabase Auth, but additional proxy endpoints might be provided.)*

- **Get Current User**
  - **Method:** GET
  - **URL:** /api/users/me
  - **Description:** Retrieve information about the authenticated user.
  - **Response (200):**
    ```json
    { "id": "uuid", "email": "user@example.com", "created_at": "timestamp" }
    ```
  - **Errors:**
    - 401 Unauthorized

- **Update Current User**
  - **Method:** PUT
  - **URL:** /api/users/me
  - **Description:** Update user account settings (e.g., change password). This may proxy to Supabase Auth functions.
  - **Request Payload:**
    ```json
    { "email": "newemail@example.com", "password": "newpassword" }
    ```
  - **Response (200):** Updated user data
  - **Errors:**
    - 400 Bad Request
    - 401 Unauthorized

### Log and Analytics Endpoints

- **Get Generation Error Logs**
  - **Method:** GET
  - **URL:** /api/generation-error-logs
  - **Description:** Retrieve generation error logs for the authenticated user.
  - **Response (200):**
    ```json
    { "errors": [ { "id": "uuid", "error_message": "..." } ] }
    ```
  - **Errors:**
    - 401 Unauthorized

## 3. Authentication and Authorization

- **Mechanism:** Token-based authentication using Supabase Auth (JWT tokens).
- **Enforcement:** Every endpoint (except those for public information, if any) requires valid authentication headers. Middleware will verify that the auth token's user ID matches the resource's user_id (using Row Level Security as configured in the database).
- **Additional Measures:** Rate limiting should be applied at the API gateway level to prevent abuse.

## 4. Validation and Business Logic

- **Input Validation:**
  - Flashcard fields: 
    - 'front' is limited to 200 characters
    - 'back' is limited to 500 characters
    - 'source' must be one of ["ai-full", "ai-edited", "manual"]
    - 'generation_id' is required for ai-full and ai-edited sources, must be null for manual
  - Pagination parameters:
    - 'pageSize' must be between 1 and 100
    - 'page' must be ≥ 1
  - AI Generation Input: Validate that the provided source text meets expected length criteria (typically between 1000 and 10000 characters) as enforced in the generations table.
- **Business Logic:**
  - **AI Flashcard Generation:** The process involves accepting a raw text, generating flashcard proposals via an AI service, returning them to the client for review, and then confirming and persisting acceptable proposals. A generation log is recorded to track usage statistics.
  - **User Ownership:** Modifications and deletions of flashcards (and access to logs) are restricted to flashcards that belong to the authenticated user.
  - **Soft Deletion:** Flashcards are soft-deleted by setting the is_deleted flag to true.
  - **Study Session Handling:** Integration with an external spaced repetition algorithm; flashcard ratings are submitted to adjust the review schedule.

## Assumptions

- The frontend will handle additional logic for editing AI-generated flashcards before confirmation.
- Account management (registration, password changes) is primarily handled by Supabase Auth, but minimal proxy endpoints may be provided.
- Error responses follow a standardized JSON structure with an error code and message.

---

This API plan is designed to align with the provided database schema, PRD, and tech stack, ensuring a robust and scalable REST API for the flashcards application. 