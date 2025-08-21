import React from 'react';
import { Bot, Play, Pause, Settings, TrendingUp, Activity, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface TradingBotProps {
  botActive: boolean;
  setBotActive: (active: boolean) => void;
  alphabotData: any;
  isUpdatingAlphabot: boolean;
  updateAlphaBot: () => void;
}

export const TradingBot: React.FC<TradingBotProps> = ({
  botActive,
  setBotActive,
  alphabotData,
  isUpdatingAlphabot,
  updateAlphaBot
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-xl border border-purple-500/20 p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AlphaBot Trading</h3>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className={`w-2 h-2 rounded-full ${botActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span>{botActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            checked={botActive}
            onCheckedChange={setBotActive}
            className="data-[state=checked]:bg-purple-500"
          />
          <Button
            variant="outline"
            size="sm"
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bot Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-xs text-slate-400">Success Rate</span>
          </div>
          <div className="text-xl font-bold text-white">
            {alphabotData?.successRate || '94.7'}%
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-slate-400">Trades Today</span>
          </div>
          <div className="text-xl font-bold text-white">
            {alphabotData?.tradesCount || '127'}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-xs text-slate-400">Avg. Profit</span>
          </div>
          <div className="text-xl font-bold text-white">
            {alphabotData?.averageProfit || '0.34'}%
          </div>
        </div>
      </div>

      {/* Bot Controls */}
      <div className="flex items-center gap-3">
        <Button
          onClick={() => setBotActive(!botActive)}
          className={`flex-1 ${
            botActive 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {botActive ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Stop Bot
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Start Bot
            </>
          )}
        </Button>

        <Button
          onClick={updateAlphaBot}
          disabled={isUpdatingAlphabot}
          variant="outline"
          className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
        >
          {isUpdatingAlphabot ? (
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            'Update'
          )}
        </Button>
      </div>

      {/* Progress Indicator */}
      {botActive && (
        <div className="mt-4 bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Next Analysis</span>
            <span className="text-xs text-green-400">2m 34s</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full animate-pulse" style={{ width: '78%' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};