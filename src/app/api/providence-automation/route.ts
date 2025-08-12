import { NextRequest } from 'next/server';
import { ProvidenceAutomation } from '@/src/lib/providenceAutomation';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      (async () => {
        let automation: ProvidenceAutomation | null = null;
        let currentProcessingStepId = 'initialize';
        
        try {
          const { username, password } = await request.json();
          
          if (!username || !password) {
            throw new Error('Missing required credentials');
          }
          
          // Step 1: Initialize Browser
          currentProcessingStepId = 'initialize';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            isRunning: true,
            currentStepId: 'initialize',
            steps: [
              { id: 'initialize', title: 'Initialize Browser', description: 'Starting Chrome browser and preparing automation', status: 'running' },
              { id: 'navigate', title: 'Navigate to Providence', description: 'Opening https://providence.gobolt.com/login', status: 'pending' },
              { id: 'login', title: 'Login to Providence', description: 'Entering credentials and logging in', status: 'pending' },
              { id: 'facility', title: 'Select Facility', description: 'Selecting YYZ5 from facility dropdown', status: 'pending' },
              { id: 'inventory', title: 'Navigate to Inventory Management', description: 'Clicking on Inventory Management tab', status: 'pending' },
              { id: 'manual-items', title: 'Open Manual Items', description: 'Clicking on Manual Items section', status: 'pending' },
              { id: 'complete', title: 'Automation Complete', description: 'All steps completed successfully', status: 'pending' }
            ]
          })}\n\n`));
          
          automation = new ProvidenceAutomation();
          await automation.initialize();
          
          // Step 2: Navigate to Providence
          currentProcessingStepId = 'navigate';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            isRunning: true,
            currentStepId: 'navigate',
            steps: [
              { id: 'initialize', title: 'Initialize Browser', description: 'Starting Chrome browser and preparing automation', status: 'completed' },
              { id: 'navigate', title: 'Navigate to Providence', description: 'Opening https://providence.gobolt.com/login', status: 'running' },
              { id: 'login', title: 'Login to Providence', description: 'Entering credentials and logging in', status: 'pending' },
              { id: 'facility', title: 'Select Facility', description: 'Selecting YYZ5 from facility dropdown', status: 'pending' },
              { id: 'inventory', title: 'Navigate to Inventory Management', description: 'Clicking on Inventory Management tab', status: 'pending' },
              { id: 'manual-items', title: 'Open Manual Items', description: 'Clicking on Manual Items section', status: 'pending' },
              { id: 'complete', title: 'Automation Complete', description: 'All steps completed successfully', status: 'pending' }
            ]
          })}\n\n`));
          
          await automation.navigateToLogin();
          
          // Step 3: Login
          currentProcessingStepId = 'login';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            isRunning: true,
            currentStepId: 'login',
            steps: [
              { id: 'initialize', title: 'Initialize Browser', description: 'Starting Chrome browser and preparing automation', status: 'completed' },
              { id: 'navigate', title: 'Navigate to Providence', description: 'Opening https://providence.gobolt.com/login', status: 'completed' },
              { id: 'login', title: 'Login to Providence', description: 'Entering credentials and logging in', status: 'running' },
              { id: 'facility', title: 'Select Facility', description: 'Selecting YYZ5 from facility dropdown', status: 'pending' },
              { id: 'inventory', title: 'Navigate to Inventory Management', description: 'Clicking on Inventory Management tab', status: 'pending' },
              { id: 'manual-items', title: 'Open Manual Items', description: 'Clicking on Manual Items section', status: 'pending' },
              { id: 'complete', title: 'Automation Complete', description: 'All steps completed successfully', status: 'pending' }
            ]
          })}\n\n`));
          
          await automation.login(username, password);
          
          // Step 4: Select Facility
          currentProcessingStepId = 'facility';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            isRunning: true,
            currentStepId: 'facility',
            steps: [
              { id: 'initialize', title: 'Initialize Browser', description: 'Starting Chrome browser and preparing automation', status: 'completed' },
              { id: 'navigate', title: 'Navigate to Providence', description: 'Opening https://providence.gobolt.com/login', status: 'completed' },
              { id: 'login', title: 'Login to Providence', description: 'Entering credentials and logging in', status: 'completed' },
              { id: 'facility', title: 'Select Facility', description: 'Selecting YYZ5 from facility dropdown', status: 'running' },
              { id: 'inventory', title: 'Navigate to Inventory Management', description: 'Clicking on Inventory Management tab', status: 'pending' },
              { id: 'manual-items', title: 'Open Manual Items', description: 'Clicking on Manual Items section', status: 'pending' },
              { id: 'complete', title: 'Automation Complete', description: 'All steps completed successfully', status: 'pending' }
            ]
          })}\n\n`));
          
          await automation.selectFacility();
          
          // Step 5: Navigate to Inventory Management
          currentProcessingStepId = 'inventory';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            isRunning: true,
            currentStepId: 'inventory',
            steps: [
              { id: 'initialize', title: 'Initialize Browser', description: 'Starting Chrome browser and preparing automation', status: 'completed' },
              { id: 'navigate', title: 'Navigate to Providence', description: 'Opening https://providence.gobolt.com/login', status: 'completed' },
              { id: 'login', title: 'Login to Providence', description: 'Entering credentials and logging in', status: 'completed' },
              { id: 'facility', title: 'Select Facility', description: 'Selecting YYZ5 from facility dropdown', status: 'completed' },
              { id: 'inventory', title: 'Navigate to Inventory Management', description: 'Clicking on Inventory Management tab', status: 'running' },
              { id: 'manual-items', title: 'Open Manual Items', description: 'Clicking on Manual Items section', status: 'pending' },
              { id: 'complete', title: 'Automation Complete', description: 'All steps completed successfully', status: 'pending' }
            ]
          })}\n\n`));
          
          await automation.navigateToInventoryManagement();
          
          // Step 6: Navigate to Manual Items
          currentProcessingStepId = 'manual-items';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            isRunning: true,
            currentStepId: 'manual-items',
            steps: [
              { id: 'initialize', title: 'Initialize Browser', description: 'Starting Chrome browser and preparing automation', status: 'completed' },
              { id: 'navigate', title: 'Navigate to Providence', description: 'Opening https://providence.gobolt.com/login', status: 'completed' },
              { id: 'login', title: 'Login to Providence', description: 'Entering credentials and logging in', status: 'completed' },
              { id: 'facility', title: 'Select Facility', description: 'Selecting YYZ5 from facility dropdown', status: 'completed' },
              { id: 'inventory', title: 'Navigate to Inventory Management', description: 'Clicking on Inventory Management tab', status: 'completed' },
              { id: 'manual-items', title: 'Open Manual Items', description: 'Clicking on Manual Items section', status: 'running' },
              { id: 'complete', title: 'Automation Complete', description: 'All steps completed successfully', status: 'pending' }
            ]
          })}\n\n`));
          
          await automation.navigateToManualItems();
          
          // Step 7: Complete
          currentProcessingStepId = 'complete';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            isRunning: false,
            currentStepId: 'complete',
            steps: [
              { id: 'initialize', title: 'Initialize Browser', description: 'Starting Chrome browser and preparing automation', status: 'completed' },
              { id: 'navigate', title: 'Navigate to Providence', description: 'Opening https://providence.gobolt.com/login', status: 'completed' },
              { id: 'login', title: 'Login to Providence', description: 'Entering credentials and logging in', status: 'completed' },
              { id: 'facility', title: 'Select Facility', description: 'Selecting YYZ5 from facility dropdown', status: 'completed' },
              { id: 'inventory', title: 'Navigate to Inventory Management', description: 'Clicking on Inventory Management tab', status: 'completed' },
              { id: 'manual-items', title: 'Open Manual Items', description: 'Clicking on Manual Items section', status: 'completed' },
              { id: 'complete', title: 'Automation Complete', description: 'All steps completed successfully', status: 'completed' }
            ]
          })}\n\n`));
          
          // Keep browser open for user to continue manually
          // Don't close the automation here
          
        } catch (error) {
          console.error('Automation error:', error);
          
          // Generate dynamic error steps based on where the failure occurred
          const allSteps = [
            { id: 'initialize', title: 'Initialize Browser', description: 'Starting Chrome browser and preparing automation' },
            { id: 'navigate', title: 'Navigate to Providence', description: 'Opening https://providence.gobolt.com/login' },
            { id: 'login', title: 'Login to Providence', description: 'Entering credentials and logging in' },
            { id: 'facility', title: 'Select Facility', description: 'Selecting YYZ5 from facility dropdown' },
            { id: 'inventory', title: 'Navigate to Inventory Management', description: 'Clicking on Inventory Management tab' },
            { id: 'manual-items', title: 'Open Manual Items', description: 'Clicking on Manual Items section' },
            { id: 'complete', title: 'Automation Complete', description: 'All steps completed successfully' }
          ];
          
          const errorSteps = allSteps.map(step => {
            if (step.id === currentProcessingStepId) {
              return { ...step, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
            } else if (allSteps.findIndex(s => s.id === step.id) < allSteps.findIndex(s => s.id === currentProcessingStepId)) {
              return { ...step, status: 'completed' };
            } else {
              return { ...step, status: 'pending' };
            }
          });
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            isRunning: false,
            currentStepId: currentProcessingStepId,
            steps: errorSteps,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          })}\n\n`));
          
          // Close automation on error
          if (automation) {
            await automation.close();
          }
        } finally {
          controller.close();
        }
      })();
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}