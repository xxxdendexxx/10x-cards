/*
Comprehensive PostgreSQL Database Schema

1. Tabele:

***users*** (zarządzana przez Supabase)
- id: UUID PRIMARY KEY 
- email: VARCHAR NOT NULL UNIQUE
- created_at: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- encrypted_password: TEXT NOT NULL
- confirmed_at: TIMESTAMPTZ

***flashcards***
- id: UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- user_id: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- front: VARCHAR(200) NOT NULL
- back: VARCHAR(500) NOT NULL
- source: VARCHAR NOT NULL CHECK (source IN ('ai-full', 'ai-edited', 'manual'))
- is_deleted: BOOLEAN NOT NULL DEFAULT FALSE
- generation_id: BIGINT REFERENCES generations(id) ON DELETE SET NULL
- created_at: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- updated_at: TIMESTAMPTZ NOT NULL DEFAULT NOW()

***sessions***
- id: UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- user_id: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- data: JSONB
- created_at: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- updated_at: TIMESTAMPTZ NOT NULL DEFAULT NOW()

***generations*** (log table - nieusuwalna)
- id : BIGSERIAL PRIMARY KEY
- user_id : UUID NOT NULL REFERENCES users ( id )
- model : VARCHAR NOT NULL
- generated_count : INTEGER NOT NULL
- accepted_unedited_count : INTEGER NULLABLE
- accepted_edited_count : INTEGER NULLABLE
- source_text_hash : VARCHAR NOT NULL
- source_text_length : INTEGER NOT NULL CHECK ( source_text_length BETWEEN 1000 AND 10000 )
- generation_duration : INTEGER NOT NULL
- created_at : TIMESTAMPTZ NOT NULL DEFAULT now ( )
- updated_at : TIMESTAMPTZ NOT NULL DEFAULT now ( )

***generation_error_logs*** (log table - nieusuwalna)
- id: UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- user_id: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- error_message: TEXT NOT NULL
- error_details: TEXT
- model: VARCHAR
- source_text_hash: VARCHAR NOT NULL
- source_text_length: INTEGER NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000)
- created_at: TIMESTAMPTZ NOT NULL DEFAULT NOW()

2. Relacje między tabelami:
- Jeden użytkownik (users) może mieć wiele flashcards, sessions, generations oraz generation_error_logs.
- Klucz obcy: flashcards.user_id, sessions.user_id, generations.user_id, generation_error_logs.user_id odnosi się do users(id).

3. Indeksy:
- INDEX ON flashcards(user_id)
- INDEX ON flashcards(source)
- INDEX ON sessions(user_id)
- INDEX ON generations(user_id)
- OPTIONAL: INDEXES ON generations(model) oraz generations(source_text_hash)
- INDEX ON generation_error_logs(user_id)
- OPTIONAL: INDEXES ON generation_error_logs(model) oraz generation_error_logs(source_text_hash)

4. Zasady PostgreSQL (RLS):
- W tabelach flashcards, generations oraz generation_error_logs wdrożyć polityki RLS, które pozwalają użytkownikowi na dostęp tylko do rekordów,
gdzie 'user_id' odpowiada identyfikatorowi użytkownika z Supabase Auth (np. auth.uid() = user_id).

5. Dodatkowe uwagi:
- Trigger: Utworzyć funkcję triggerową (np. update_updated_at) dla tabel flashcards i sessions, która automatycznie aktualizuje kolumnę updated_at przy każdej modyfikacji.
- Logi (tabele generations oraz generation_error_logs) są nieusuwalne – nie stosujemy mechanizmu soft delete.
- Operacje tworzenia fiszek wraz z logowaniem generacji powinny być wykonywane w ramach transakcji, aby zapewnić spójność danych.

*/ 