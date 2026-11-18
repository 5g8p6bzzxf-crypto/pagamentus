ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS departamento VARCHAR(150),
  ADD COLUMN IF NOT EXISTS regime_contratual VARCHAR(100);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'employees'::regclass
      AND conname = 'uq_employees_organization_id_id'
  ) THEN
    ALTER TABLE employees
      ADD CONSTRAINT uq_employees_organization_id_id UNIQUE (organization_id, id);
  END IF;
END
$$;

ALTER TABLE contract_changes
  ADD COLUMN IF NOT EXISTS jornada_anterior VARCHAR(50),
  ADD COLUMN IF NOT EXISTS nova_jornada VARCHAR(50),
  ADD COLUMN IF NOT EXISTS departamento_anterior VARCHAR(150),
  ADD COLUMN IF NOT EXISTS novo_departamento VARCHAR(150),
  ADD COLUMN IF NOT EXISTS regime_anterior VARCHAR(100),
  ADD COLUMN IF NOT EXISTS novo_regime VARCHAR(100);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'contract_changes'::regclass
      AND conname = 'ck_contract_changes_salary_values'
  ) THEN
    ALTER TABLE contract_changes
      ADD CONSTRAINT ck_contract_changes_salary_values
      CHECK (
        (salario_anterior IS NULL OR salario_anterior >= 0)
        AND (novo_salario IS NULL OR novo_salario >= 0)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'variable_events'::regclass
      AND conname = 'ck_variable_events_competencia'
  ) THEN
    ALTER TABLE variable_events
      ADD CONSTRAINT ck_variable_events_competencia
      CHECK (
        competencia ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'
        AND substring(competencia, 1, 4) <> '0000'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'variable_events'::regclass
      AND conname = 'ck_variable_events_values'
  ) THEN
    ALTER TABLE variable_events
      ADD CONSTRAINT ck_variable_events_values
      CHECK (
        valor >= 0
        AND (quantidade IS NULL OR quantidade >= 0)
        AND (percentual IS NULL OR percentual >= 0)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'leaves'::regclass
      AND conname = 'ck_leaves_date_range'
  ) THEN
    ALTER TABLE leaves
      ADD CONSTRAINT ck_leaves_date_range
      CHECK (data_fim IS NULL OR data_fim >= data_inicio);
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS time_records (
  id BIGSERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  data DATE NOT NULL,
  entrada TIME,
  saida_almoco TIME,
  retorno_almoco TIME,
  saida TIME,
  horas_trabalhadas NUMERIC(5, 2) NOT NULL,
  horas_extras NUMERIC(5, 2) NOT NULL DEFAULT 0,
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_time_records_org_employee_date
    UNIQUE (organization_id, employee_id, data),
  CONSTRAINT ck_time_records_hours
    CHECK (
      horas_trabalhadas BETWEEN 0 AND 24
      AND horas_extras BETWEEN 0 AND horas_trabalhadas
    ),
  CONSTRAINT ck_time_records_marks
    CHECK (
      (entrada IS NULL AND saida IS NULL AND saida_almoco IS NULL AND retorno_almoco IS NULL)
      OR (
        entrada IS NOT NULL
        AND saida IS NOT NULL
        AND entrada < saida
        AND (
          (saida_almoco IS NULL AND retorno_almoco IS NULL)
          OR (
            saida_almoco IS NOT NULL
            AND retorno_almoco IS NOT NULL
            AND entrada < saida_almoco
            AND saida_almoco < retorno_almoco
            AND retorno_almoco < saida
          )
        )
      )
    )
);

CREATE TABLE IF NOT EXISTS benefits (
  id BIGSERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  tipo VARCHAR(50) NOT NULL
    CHECK (tipo IN ('vale_transporte', 'vale_refeicao', 'vale_alimentacao', 'plano_saude')),
  descricao VARCHAR(255),
  valor NUMERIC(12, 2) NOT NULL CHECK (valor >= 0),
  desconto_empregado NUMERIC(12, 2) NOT NULL DEFAULT 0
    CHECK (desconto_empregado >= 0 AND desconto_empregado <= valor),
  data_inicio DATE NOT NULL,
  data_fim DATE,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ck_benefits_date_range
    CHECK (data_fim IS NULL OR data_fim >= data_inicio)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'variable_events'::regclass
      AND conname = 'fk_variable_events_employee_tenant'
  ) THEN
    ALTER TABLE variable_events
      ADD CONSTRAINT fk_variable_events_employee_tenant
      FOREIGN KEY (organization_id, employee_id)
      REFERENCES employees (organization_id, id)
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'leaves'::regclass
      AND conname = 'fk_leaves_employee_tenant'
  ) THEN
    ALTER TABLE leaves
      ADD CONSTRAINT fk_leaves_employee_tenant
      FOREIGN KEY (organization_id, employee_id)
      REFERENCES employees (organization_id, id)
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'contract_changes'::regclass
      AND conname = 'fk_contract_changes_employee_tenant'
  ) THEN
    ALTER TABLE contract_changes
      ADD CONSTRAINT fk_contract_changes_employee_tenant
      FOREIGN KEY (organization_id, employee_id)
      REFERENCES employees (organization_id, id)
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'time_records'::regclass
      AND conname = 'fk_time_records_employee_tenant'
  ) THEN
    ALTER TABLE time_records
      ADD CONSTRAINT fk_time_records_employee_tenant
      FOREIGN KEY (organization_id, employee_id)
      REFERENCES employees (organization_id, id)
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'benefits'::regclass
      AND conname = 'fk_benefits_employee_tenant'
  ) THEN
    ALTER TABLE benefits
      ADD CONSTRAINT fk_benefits_employee_tenant
      FOREIGN KEY (organization_id, employee_id)
      REFERENCES employees (organization_id, id)
      ON DELETE CASCADE;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS ix_variable_events_employee_competencia
  ON variable_events (organization_id, employee_id, competencia);
CREATE INDEX IF NOT EXISTS ix_leaves_employee_period
  ON leaves (organization_id, employee_id, data_inicio, data_fim);
CREATE INDEX IF NOT EXISTS ix_contract_changes_employee_effective
  ON contract_changes (organization_id, employee_id, data_alteracao DESC);
CREATE INDEX IF NOT EXISTS ix_benefits_employee_active
  ON benefits (organization_id, employee_id, ativo);
