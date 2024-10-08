import { useCallback } from 'react'

import { fs, AppConfiguration } from '@janhq/core'
import { atom, useAtomValue, useSetAtom } from 'jotai'

import { useActiveModel } from './useActiveModel'

import { defaultJanDataFolderAtom } from '@/helpers/atoms/App.atom'

export enum FactoryResetState {
  Idle = 'idle',
  Starting = 'starting',
  StoppingModel = 'stopping_model',
  DeletingData = 'deleting_data',
  ClearLocalStorage = 'clear_local_storage',
}

export const factoryResetStateAtom = atom(FactoryResetState.Idle)

export default function useFactoryReset() {
  const defaultJanDataFolder = useAtomValue(defaultJanDataFolderAtom)
  const { stopModel } = useActiveModel()
  const setFactoryResetState = useSetAtom(factoryResetStateAtom)

  const resetAll = useCallback(
    async (keepCurrentFolder?: boolean) => {
      setFactoryResetState(FactoryResetState.Starting)
      // read the place of jan data folder
      const appConfiguration: AppConfiguration | undefined =
        await window.core?.api?.getAppConfigurations()

      if (!appConfiguration) {
        console.debug('Failed to get app configuration')
      }

      const janDataFolderPath = appConfiguration!.data_folder
      // 1: Stop running model
      setFactoryResetState(FactoryResetState.StoppingModel)
      await stopModel()
      await new Promise((resolve) => setTimeout(resolve, 4000))

      // 2: Delete the old jan data folder
      setFactoryResetState(FactoryResetState.DeletingData)
      await fs.rm(janDataFolderPath)

      // 3: Set the default jan data folder
      if (!keepCurrentFolder) {
        // set the default jan data folder to user's home directory
        const configuration: AppConfiguration = {
          data_folder: defaultJanDataFolder,
          quick_ask: appConfiguration?.quick_ask ?? false,
        }
        await window.core?.api?.updateAppConfiguration(configuration)
      }

      // 4: Clear app local storage
      setFactoryResetState(FactoryResetState.ClearLocalStorage)
      // reset the localStorage
      localStorage.clear()

      // 5: Relaunch the app
      await window.core?.api?.relaunch()
    },
    [defaultJanDataFolder, stopModel, setFactoryResetState]
  )

  return {
    resetAll,
  }
}
