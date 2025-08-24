import React from "react";
import { Rss, TrendingUp, Users, MessageCircle } from "lucide-react";

const FeedPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Rss className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Feed</h1>
          </div>
          <p className="text-gray-600">
            Stay updated with the latest job opportunities, industry news, and
            career insights.
          </p>
        </div>

        {/* Feed Content */}
        <div className="space-y-6">
          {/* Placeholder Feed Items */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  New Job Opportunities in Tech
                </h3>
                <p className="text-gray-600 mb-3">
                  Discover the latest job openings in software development, AI,
                  and data science. Companies are actively hiring for remote and
                  hybrid positions.
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>2 hours ago</span>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>128 views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>12 comments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Industry Insights: Remote Work Trends
                </h3>
                <p className="text-gray-600 mb-3">
                  Learn about the latest trends in remote work and how companies
                  are adapting their hiring processes for distributed teams.
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>4 hours ago</span>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>89 views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>7 comments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Career Development Tips
                </h3>
                <p className="text-gray-600 mb-3">
                  Essential skills and certifications that can help advance your
                  career in the current job market.
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>1 day ago</span>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>256 views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>18 comments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <Rss className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-blue-900 mb-2">
              More Content Coming Soon!
            </h3>
            <p className="text-blue-700">
              We're working on bringing you personalized job recommendations,
              industry news, and career insights tailored to your preferences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
