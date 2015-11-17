(function () {
  'use strict';

  /**
   * A factory to take care of fetching hunt members and any other
   * data handling logic for hunt members.
   */

  angular
    .module('uc.hurondetails')
    .factory('HuntGroupMemberDataService', HuntGroupMemberDataService);

  /* @ngInject */

  function HuntGroupMemberDataService(HuntGroupService, Notification, $q) {

    var selectedHuntMembers = [];
    var currentOpenMemberUuid = '';
    var pristineSelectedHuntMembers;

    return {
      selectMember: selectMember,
      removeMember: removeMember,
      fetchMembers: fetchMembers,
      fetchHuntMembers: fetchHuntMembers,
      getDisplayName: getDisplayName,
      toggleMemberPanel: toggleMemberPanel,
      getMembersNumberUuidJSON: getMembersNumberUuidJSON,
      reset: reset,
      setMemberJSON: setMemberJSON,
      getHuntMembers: getHuntMembers,
      checkMemberDirtiness: checkMemberDirtiness
    };

    ////////////////

    function checkMemberDirtiness(pristineMember) {
      var dirty = false;
      selectedHuntMembers.some(function (m) {
        if (pristineMember.userUuid === m.user.uuid) {
          dirty = (pristineMember.numberUuid === m.selectableNumber.uuid);
        }
        return dirty;
      });
      return dirty;
    }

    function getHuntMembers() {
      return selectedHuntMembers;
    }

    /**
     * Given hunt members "members" field JSON received from
     * GET /huntgroups/{id} initialize the data model for the UI
     */
    function setMemberJSON(users, resetFromBackend) {
      reset(resetFromBackend);

      if (resetFromBackend) {
        users.forEach(function (user) {
          HuntGroupService.getHuntMemberWithSelectedNumber(user).then(function (m) {
            selectedHuntMembers.push(m);
            pristineSelectedHuntMembers = angular.copy(selectedHuntMembers);
          });
        });
      } else {
        selectedHuntMembers = angular.copy(pristineSelectedHuntMembers);
      }
      return selectedHuntMembers;
    }

    /**
     * Reset the single data service to its origin state.
     */
    function reset(doneResetPristine, resetFromBackend) {
      selectedHuntMembers.splice(0, selectedHuntMembers.length);
      currentOpenMemberUuid = '';
      if (resetFromBackend) {
        pristineSelectedHuntMembers = undefined;
      }
    }

    /**
     * Return the JSON data format to be used for POST & PUT
     * operations.
     */
    function getMembersNumberUuidJSON() {
      var members = [];
      selectedHuntMembers.forEach(function (member) {
        members.push(member.selectableNumber.uuid);
      });
      return members;
    }

    /**
     * Logic for accordion opening of member panel.
     */
    function toggleMemberPanel(userUuid) {
      if (currentOpenMemberUuid === userUuid) {
        currentOpenMemberUuid = undefined;
      } else {
        currentOpenMemberUuid = userUuid;
      }
      return currentOpenMemberUuid;
    }

    /**
     * Feeder for the data service from the UI.
     */
    function selectMember(member) {
      selectedHuntMembers.push(member);
      return selectedHuntMembers;
    }

    /**
     * Remove the member for the data service once it
     * is removed from UI.
     */
    function removeMember(user) {
      selectedHuntMembers.splice(
        selectedHuntMembers.indexOf(user), 1);
      currentOpenMemberUuid = undefined;
    }

    /**
     * Return the hunt members from the backend based
     * on the nameHint, but filter those selected on
     * UI already from showing.
     */
    function fetchHuntMembers(nameHint) {
      return fetchMembers(nameHint, {
        sourceKey: 'uuid',
        responseKey: 'uuid',
        dataToStrip: selectedHuntMembers
      });
    }

    /**
     * Given a hint and a filter function, fetch the huron
     * users from the backend and apply the filtering logic.
     */
    function fetchMembers(nameHint, filter) {
      var GetHuntMembers = HuntGroupService.getHuntMembers(nameHint);

      if (GetHuntMembers) {
        GetHuntMembers.setOnFailure(function (response) {
          Notification.errorResponse(response, 'huronHuntGroup.memberFetchFailure');
        });
        if (filter) {
          GetHuntMembers.setFilter(filter);
        }
        return GetHuntMembers.fetch();
      }

      return [];
    }

    /**
     * Simple utility to display firstName and lastName
     * concatenated with a space.
     */
    function getDisplayName(user) {
      if (!user || (!user.firstName && !user.lastName))
        return;

      if (user.lastName) {
        return user.firstName + " " + user.lastName;
      } else {
        return user.firstName;
      }
    }
  }
})();
