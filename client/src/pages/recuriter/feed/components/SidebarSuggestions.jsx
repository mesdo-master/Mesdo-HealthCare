import React from "react";
import { Plus, X } from "lucide-react";

const SidebarSuggestions = () => {
  const peopleYouMightKnow = [
    {
      id: 1,
      name: "Alena Baptista",
      title: "Dental Surgeon | April",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b1c1?w=150",
      mutualConnections: 12,
    },
    {
      id: 2,
      name: "Mira Curtis",
      title: "Dental Surgeon | April",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      mutualConnections: 8,
    },
    {
      id: 3,
      name: "Ashlynn Rosser",
      title: "Dental Surgeon | April",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      mutualConnections: 15,
    },
    {
      id: 4,
      name: "Alfonso Sipmon",
      title: "Dental Surgeon | April",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      mutualConnections: 6,
    },
    {
      id: 5,
      name: "Jakob Dias",
      title: "Dental Surgeon | April",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      mutualConnections: 20,
    },
    {
      id: 6,
      name: "Chance Carzonl",
      title: "Dental Surgeon | April",
      avatar:
        "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150",
      mutualConnections: 3,
    },
  ];

  const basedOnCommunities = [
    {
      id: 1,
      name: "Alena Baptista",
      title: "Dental Surgeon | April",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b1c1?w=150",
      community: "Medical Professionals",
    },
    {
      id: 2,
      name: "Mira Curtis",
      title: "Dental Surgeon | April",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      community: "Healthcare Network",
    },
    {
      id: 3,
      name: "Ashlynn Rosser",
      title: "Dental Surgeon | April",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      community: "Dental Community",
    },
    {
      id: 4,
      name: "Alfonso Sipmon",
      title: "Dental Surgeon | April",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      community: "Medical Professionals",
    },
    {
      id: 5,
      name: "Jakob Dias",
      title: "Dental Surgeon | April",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      community: "Healthcare Network",
    },
    {
      id: 6,
      name: "Chance Carzonl",
      title: "Dental Surgeon | April",
      avatar:
        "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150",
      community: "Medical Professionals",
    },
  ];

  const SuggestionCard = ({
    person,
    showFollow = true,
    showDismiss = false,
  }) => (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3">
        <img
          src={person.avatar}
          alt={person.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h4 className="font-semibold text-sm text-gray-900">{person.name}</h4>
          <p className="text-xs text-gray-500">{person.title}</p>
          {person.mutualConnections && (
            <p className="text-xs text-gray-400">
              {person.mutualConnections} mutual connections
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {showFollow && (
          <button
            className="font-medium hover:opacity-80 transition-opacity"
            style={{
              color: "#1890FF",
              fontSize: "14px",
            }}
          >
            + Follow
          </button>
        )}
        {showDismiss && (
          <button className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* People you might know */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">People you might know</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {peopleYouMightKnow.map((person) => (
            <SuggestionCard key={person.id} person={person} showFollow={true} />
          ))}
        </div>
      </div>

      {/* Based on your communities */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">
            Based on your communities
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {basedOnCommunities.map((person) => (
            <SuggestionCard key={person.id} person={person} showFollow={true} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SidebarSuggestions;
