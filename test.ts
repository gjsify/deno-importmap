import { strictEqual as assertEquals, throws as assertThrows } from 'assert'
import { ImportMap, resolveImportMap, resolveModuleSpecifier } from "./mod.js";
import { isImportMap } from "./_util.js";
import { readFile, readdir } from 'fs/promises';
import path from 'path';

interface TestData {
  importMap: ImportMap;
  importMapBaseURL: string;
  baseURL: string;
  expectedResults?: Record<string, unknown>;
  expectedParsedImportMap?: ImportMap;
  tests?: Record<string, TestData>;
}

function runTests(
  name: string,
  {
    importMap,
    importMapBaseURL,
    baseURL,
    expectedResults,
    expectedParsedImportMap,
  }: TestData,
) {
  Deno.test({
    name,
    fn: () => {
      if (
        !isImportMap(importMap)
      ) {
        assertThrows(() => {
          resolveImportMap(
            importMap,
            new URL(importMapBaseURL),
          );
        });
      } else if (expectedParsedImportMap === null) {
        assertThrows(() => {
          resolveImportMap(
            importMap,
            new URL(importMapBaseURL),
          );
        });
      } else {
        const resolvedImportMap = resolveImportMap(
          importMap,
          new URL(importMapBaseURL),
        );
        if (expectedParsedImportMap) {
          assertEquals(resolvedImportMap, expectedParsedImportMap);
        }
        if (expectedResults) {
          for (
            const [key, expectedResult] of Object.entries(expectedResults)
          ) {
            if (expectedResult === null) {
              assertThrows(() => {
                resolveModuleSpecifier(
                  key,
                  resolvedImportMap,
                  new URL(baseURL),
                );
              });
            } else {
              const resolvedModuleSpecifier = resolveModuleSpecifier(
                key,
                resolvedImportMap,
                new URL(baseURL),
              );
              assertEquals(resolvedModuleSpecifier, expectedResult);
            }
          }
        }
      }
    },
  });
}

function createTests(name: string, data: TestData) {
  const {
    tests,
    importMap,
    importMapBaseURL,
    baseURL,
  } = data;
  if (tests) {
    for (const [testName, test] of Object.entries(tests)) {
      const combinedName = `${name} → ${testName}`;
      const inheritedTestData = {
        importMap: test.importMap || importMap,
        importMapBaseURL: test.importMapBaseURL || importMapBaseURL,
        baseURL: test.baseURL || baseURL,
        expectedParsedImportMap: test.expectedParsedImportMap,
        expectedResults: test.expectedResults,
        tests: test.tests,
      };
      createTests(combinedName, inheritedTestData);
    }
  } else {
    runTests(name, data);
  }
}

// testdata from https://github.com/web-platform-tests/wpt/tree/master/import-maps/data-driven/resources
const testdataDir = "testdata";
for await (const fileName of await readdir(testdataDir)) {
  const file = await readFile(path.join(testdataDir, fileName), 'utf8');
  const data = JSON.parse(file);
  createTests(fileName, data);
}
