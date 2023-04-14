import { useForm } from "@mantine/form";
import { lazy, Suspense, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";

import { Group } from "@mantine/core";
import { useParams } from "react-router-dom";
import { NextButton } from "../components/NextButton";
import ResponseSwitcher from "../components/stimuli/inputcomponents/ResponseSwitcher";
import { TrialsComponent } from "../parser/types";
import { useCurrentStep } from "../routes";
import {
  saveTrialAnswer,
  useAppDispatch,
  useAppSelector,
  useNextStep,
  useTrialStatus,
} from "../store";

export function useTrialsConfig() {
  const currentStep = useCurrentStep();

  return useAppSelector((state) => {
    const { config } = state.study;
    const component = currentStep ? config?.components[currentStep] : null;

    if (!config || !currentStep || component?.type !== "trials") return null;

    return config.components[currentStep] as TrialsComponent;
  });
}

export function useNextTrialId(currentTrial: string | null) {
  const config = useTrialsConfig();

  if (!currentTrial || !config) return null;

  const { order } = config;

  const idx = order.findIndex((t) => t === currentTrial);

  if (idx === -1) return null;

  return order[idx + 1] || null;
}

export default function TrialController() {
  const dispatch = useAppDispatch();
  const currentStep = useCurrentStep();
  const nextStep = useNextStep();
  const { trialId = null } = useParams<{ trialId: string }>();
  const config = useTrialsConfig();
  const nextTrailId = useNextTrialId(trialId);
  const trialStatus = useTrialStatus(trialId);

  const answerField = useForm({
    initialValues: {
      input: trialStatus.answer || "",
    },
    transformValues(values) {
      return {
        answer: parseFloat(values.input),
      };
    },
    validate: {
      input: (value) => {
        if (value.length === 0) return null;
        const ans = parseFloat(value);
        if (isNaN(ans)) return "Please enter a number";
        return ans < 0 || ans > 100 ? "The answer is range from 0 - 100" : null;
      },
    },
    validateInputOnChange: ["input"],
  });

  useEffect(() => {
    answerField.setFieldValue("input", trialStatus.answer || "");
  }, [trialStatus.answer]);

  if (!trialId || !config) return null;

  const response = config?.response;
  const stimulus = config.trials[trialId];
  const componentPath = stimulus.stimulus.path;

  const StimulusComponent = useMemo(() => {
    if (!componentPath || componentPath.length === 0) return null;

    return lazy(
      () => import(/* @vite-ignore */ `../components/${componentPath}`)
    );
  }, [componentPath]);

  return (
    <div key={trialId}>
      <ReactMarkdown>{stimulus.instruction}</ReactMarkdown>
      {StimulusComponent && (
        <Suspense fallback={<div>Loading...</div>}>
          <StimulusComponent parameters={stimulus.stimulus.parameters} />
          <ResponseSwitcher
            id={response.id}
            type={response.type}
            desc={response.desc}
            prompt={response.prompt}
            required={response.required}
            options={response.options}
          />
        </Suspense>
      )}
      <Group position="right" spacing="xs" mt="xl">
        {nextTrailId ? (
          <NextButton
            disabled={
              !trialStatus.complete &&
              (answerField.values.input.length === 0 ||
                !answerField.isValid("input"))
            }
            to={`/${currentStep}/${nextTrailId}`}
            process={() => {
              if (trialStatus.complete) {
                answerField.setFieldValue("input", "");
              }

              const answer = answerField.getTransformedValues().answer;

              dispatch(
                saveTrialAnswer({
                  trialName: currentStep,
                  trialId,
                  answer: answer.toString(),
                })
              );

              answerField.setFieldValue("input", "");
            }}
          />
        ) : (
          <NextButton
            to={`/${nextStep}`}
            process={() => {
              // complete trials
            }}
          />
        )}
      </Group>
    </div>
  );
}
