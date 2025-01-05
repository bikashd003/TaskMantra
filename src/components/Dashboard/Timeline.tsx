/* eslint-disable @next/next/no-img-element */
import React from 'react';

const Timeline = () => {
    return (
        <div className="bg-white w-full p-4 lg:p-6 rounded-2xl shadow-lg max-h-[40vh] overflow-y-auto">
            {/* Tabs */}
            <div className="flex items-center gap-3 mb- pb-2 overflow-x-auto scrollbar-hide">
                <button className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition-all whitespace-nowrap">
                    Project Timeline
                </button>
                <button className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-all whitespace-nowrap">
                    Project Notes
                </button>
            </div>

            {/* Timeline */}
            <div className="relative pl-6 space-y-4 overflow-y-auto max-h-[calc(100%-4rem)]">
                {/* Vertical Line */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {/* Timeline Item 1 */}
                <div className="relative">
                    {/* Connector Circle */}
                    <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-3 border-blue-600 bg-white"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-blue-50/70 p-3 rounded-xl shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                <img
                                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40"
                                    className="w-7 h-7 rounded-full border-2 border-white"
                                    alt="User 1"
                                />
                                <img
                                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40"
                                    className="w-7 h-7 rounded-full border-2 border-white"
                                    alt="User 2"
                                />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800">Developing State</h3>
                                <p className="text-xs text-gray-500">5 March - 11 April</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full mt-2 sm:mt-0 w-fit">
                            On Progress
                        </span>
                    </div>
                </div>

                {/* Timeline Item 2 */}
                <div className="relative">
                    {/* Connector Circle */}
                    <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-3 border-emerald-600 bg-white"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-emerald-50/70 p-3 rounded-xl shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                <img
                                    src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=40&h=40"
                                    className="w-7 h-7 rounded-full border-2 border-white"
                                    alt="User 3"
                                />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800">UI Design Website</h3>
                                <p className="text-xs text-gray-500">20 February - 28 March</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-emerald-600 text-white text-xs rounded-full mt-2 sm:mt-0 w-fit">
                            Done
                        </span>
                    </div>
                </div>
                <div className="relative">
                    {/* Connector Circle */}
                    <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-3 border-emerald-600 bg-white"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-emerald-50/70 p-3 rounded-xl shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                <img
                                    src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=40&h=40"
                                    className="w-7 h-7 rounded-full border-2 border-white"
                                    alt="User 3"
                                />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800">UI Design Website</h3>
                                <p className="text-xs text-gray-500">20 February - 28 March</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-emerald-600 text-white text-xs rounded-full mt-2 sm:mt-0 w-fit">
                            Done
                        </span>
                    </div>
                </div>
                <div className="relative">
                    {/* Connector Circle */}
                    <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-3 border-emerald-600 bg-white"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-emerald-50/70 p-3 rounded-xl shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                <img
                                    src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=40&h=40"
                                    className="w-7 h-7 rounded-full border-2 border-white"
                                    alt="User 3"
                                />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800">UI Design Website</h3>
                                <p className="text-xs text-gray-500">20 February - 28 March</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-emerald-600 text-white text-xs rounded-full mt-2 sm:mt-0 w-fit">
                            Done
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timeline;
