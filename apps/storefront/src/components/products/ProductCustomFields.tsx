
import type { CustomField } from "@spree/sdk";
import {
  BarChart3,
  Cake,
  Clock3,
  Languages,
  Tag,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

interface ProductCustomFieldsProps {
  customFields?: Array<CustomField>;
}

type DisplayItem = {
  id: string;
  label: string;
  value: ReactNode;
  icon: typeof Users;
};

function normalizeLabel(label: string): string {
  return label.trim().toLocaleLowerCase("ro-RO");
}

function formatNumber(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? new Intl.NumberFormat("ro-RO", {
        maximumFractionDigits: 2,
      }).format(number)
    : String(value);
}

function renderValue(
  field: CustomField,
  yes: string,
  no: string,
): ReactNode {
  switch (field.field_type) {
    case "boolean":
      return field.value ? yes : no;

    case "number":
      return formatNumber(field.value);

    case "json":
      return typeof field.value === "string"
        ? field.value
        : JSON.stringify(field.value);

    case "rich_text":
      return (
        <span
          dangerouslySetInnerHTML={{
            __html: String(field.value ?? ""),
          }}
        />
      );

    default:
      return String(field.value ?? "");
  }
}

function buildDisplayItems(
  fields: CustomField[],
  yes: string,
  no: string,
): DisplayItem[] {
  const fieldMap = new Map(
    fields.map((field) => [normalizeLabel(field.label), field]),
  );

  const usedIds = new Set<string>();
  const items: DisplayItem[] = [];

  function findField(label: string): CustomField | undefined {
    return fieldMap.get(normalizeLabel(label));
  }

  function addItem(
    id: string,
    label: string,
    value: ReactNode,
    icon: typeof Users,
    sourceFields: Array<CustomField | undefined>,
  ) {
    items.push({ id, label, value, icon });

    sourceFields.forEach((field) => {
      if (field) usedIds.add(String(field.id));
    });
  }

  // Număr de jucători
  const minPlayers = findField("Număr minim de jucători");
  const maxPlayers = findField("Număr maxim de jucători");

  if (minPlayers || maxPlayers) {
    const min = minPlayers ? formatNumber(minPlayers.value) : "";
    const max = maxPlayers ? formatNumber(maxPlayers.value) : "";

    const value =
      min && max
        ? min === max
          ? min
          : `${min}–${max}`
        : min || max;

    addItem(
      "players",
      "Număr de jucători",
      `${value} jucători`,
      Users,
      [minPlayers, maxPlayers],
    );
  }

  // Vârsta recomandată
  const age = findField("Vârsta minimă recomandată");

  if (age) {
    addItem(
      "age",
      "Vârsta recomandată",
      `${formatNumber(age.value)}+ ani`,
      Cake,
      [age],
    );
  }

  // Durata jocului
  const minDuration = findField("Durata minimă (minute)");
  const maxDuration = findField("Durata maximă (minute)");

  if (minDuration || maxDuration) {
    const min = minDuration ? formatNumber(minDuration.value) : "";
    const max = maxDuration ? formatNumber(maxDuration.value) : "";

    const value =
      min && max
        ? min === max
          ? min
          : `${min}–${max}`
        : min || max;

    addItem(
      "duration",
      "Durata jocului",
      `${value} min`,
      Clock3,
      [minDuration, maxDuration],
    );
  }

  // Limba jocului
  const language = findField("Limba jocului");

  if (language) {
    addItem(
      "language",
      "Limba jocului",
      renderValue(language, yes, no),
      Languages,
      [language],
    );
  }

  // Complexitate
  const complexity = findField("Complexitate");

  if (complexity) {
    addItem(
      "complexity",
      "Complexitate",
      renderValue(complexity, yes, no),
      BarChart3,
      [complexity],
    );
  }

  // Alte câmpuri personalizate
  fields.forEach((field) => {
    if (usedIds.has(String(field.id))) return;

    addItem(
      String(field.id),
      field.label,
      renderValue(field, yes, no),
      Tag,
      [field],
    );
  });

  return items;
}

export function ProductCustomFields({
  customFields,
}: ProductCustomFieldsProps): React.JSX.Element | null {
  const t = useTranslations("products");

  // Nu afișăm câmpurile fără valori
  const fields = (customFields ?? []).filter(
    (field) =>
      field.value !== null &&
      field.value !== undefined &&
      field.value !== "",
  );

  if (fields.length === 0) {
    return null;
  }

  const items = buildDisplayItems(
    fields,
    t("yes"),
    t("no"),
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-10 border-t pt-8">
      <h2 className="mb-5 text-xl font-semibold text-gray-900">
        Detalii joc
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4"
            >
              <div className="shrink-0 rounded-lg bg-white p-2 text-gray-700">
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-gray-500">
                  {item.label}
                </p>

                <div className="mt-1 text-sm font-semibold text-gray-900">
                  {item.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
