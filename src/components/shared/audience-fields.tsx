import { FormMultiSelect, FormSelect } from "@/components/shared/form-fields";
import { useGetDepartmentOptionsQuery } from "@/redux/apis/departmentApis";
import { useGetDesignationOptionsQuery } from "@/redux/apis/designationApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { useGetFileShareTargetsQuery } from "@/redux/apis/fileManagerApis";
import { AUDIENCE_LABELS, AUDIENCE_TYPES, type AudienceType } from "@/types/domain/policy";
import * as React from "react";
import type { Control, FieldValues, Path } from "react-hook-form";

const AUDIENCE_OPTIONS = AUDIENCE_TYPES.map((value) => ({
  value,
  label: AUDIENCE_LABELS[value],
}));

export interface AudienceFieldValues {
  audience: AudienceType;
  departmentIds: string[];
  designationIds: string[];
  employeeIds: string[];
  userIds: string[];
}

interface AudienceFieldsProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  audience: AudienceType;
  label?: string;
  description?: string;
}

export function AudienceFields<TFieldValues extends FieldValues>({
  control,
  audience,
  label = "Who sees this",
  description = "Everyone in the company, unless you narrow it down.",
}: AudienceFieldsProps<TFieldValues>) {
  const { data: departments } = useGetDepartmentOptionsQuery(undefined, {
    skip: audience !== "DEPARTMENTS",
  });
  const { data: designations } = useGetDesignationOptionsQuery(undefined, {
    skip: audience !== "DESIGNATIONS",
  });
  const { data: employees } = useGetEmployeeOptionsQuery(undefined, {
    skip: audience !== "EMPLOYEES",
  });
  const { data: shareTargets } = useGetFileShareTargetsQuery(undefined, {
    skip: audience !== "USERS",
  });

  const departmentOptions = React.useMemo(
    () => (departments ?? []).map((row) => ({ value: row._id, label: row.name, hint: row.code })),
    [departments]
  );

  const designationOptions = React.useMemo(
    () => (designations ?? []).map((row) => ({ value: row._id, label: row.name, hint: row.code })),
    [designations]
  );

  const employeeOptions = React.useMemo(
    () =>
      (employees ?? []).map((row) => ({
        value: row._id,
        label: row.name,
        hint: row.employeeCode,
      })),
    [employees]
  );

  const userOptions = React.useMemo(
    () =>
      (shareTargets?.users ?? []).map((row) => ({
        value: row._id,
        label: row.name,
        hint: row.email,
      })),
    [shareTargets]
  );

  return (
    <div className="space-y-4">
      <FormSelect
        control={control}
        name={"audience" as Path<TFieldValues>}
        label={label}
        options={AUDIENCE_OPTIONS}
        description={description}
      />

      {audience === "DEPARTMENTS" && (
        <FormMultiSelect
          control={control}
          name={"departmentIds" as Path<TFieldValues>}
          label="Departments"
          options={departmentOptions}
          placeholder="Pick departments"
        />
      )}

      {audience === "DESIGNATIONS" && (
        <FormMultiSelect
          control={control}
          name={"designationIds" as Path<TFieldValues>}
          label="Designations"
          options={designationOptions}
          placeholder="Pick designations"
        />
      )}

      {audience === "EMPLOYEES" && (
        <FormMultiSelect
          control={control}
          name={"employeeIds" as Path<TFieldValues>}
          label="Employees"
          options={employeeOptions}
          placeholder="Pick employees"
          searchable
        />
      )}

      {audience === "USERS" && (
        <FormMultiSelect
          control={control}
          name={"userIds" as Path<TFieldValues>}
          label="Users"
          options={userOptions}
          placeholder="Pick users"
          searchable
        />
      )}
    </div>
  );
}
